import queryString from 'query-string'

import { autop } from '@wordpress/autop'

import { logError } from 'utils/log'

import { type BlogCategory } from '../../types'
import { sanitizeHtmlContent, sanitizeTextContent } from '../../utils/sanitize'

import { type WordPressConfig } from './types'
import { fetchMediaMap, wpFetch } from './utils'

type WpCategory = {
  id: number
  name: string
  slug: string
  parent: number
  count: number
  description?: string
}

type WpTag = {
  name: string
  slug: string
  count: number
}

/**
 * WordPress Taxonomies (Categories & Tags) API methods
 */
export class TaxonomiesService {
  constructor(private config: WordPressConfig) {}

  /**
   * Resolve ACF section images by fetching media items
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async resolveAcfSectionsInCategory(category: any): Promise<void> {
    if (!category.acf?.sections || !Array.isArray(category.acf.sections)) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionImageIds = (category.acf.sections as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => s.image)
      .filter((id: unknown): id is number => typeof id === 'number' && id > 0)

    if (!sectionImageIds.length) return

    try {
      const mediaMap = await fetchMediaMap(this.config, sectionImageIds)

      // Merge section images with existing attachments
      category._embedded = category._embedded ?? {}
      category._embedded['acf:attachment'] = [
        ...(category._embedded['acf:attachment'] ?? []),
        ...Array.from(mediaMap.values())
      ]
    } catch (error) {
      logError(`[resolveAcfSectionsInCategory] ${(error as Error).message}`)
    }
  }

  /**
   * Get all categories with post counts
   */
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const allCategories: WpCategory[] = []
      let page = 1
      let totalPages = 1

      do {
        const query = queryString.stringify({ per_page: 100, page })
        const { data: categories, headers } = await wpFetch(
          this.config,
          `/categories?${query}`
        )
        allCategories.push(...(categories as WpCategory[]))
        totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
        page++
      } while (page <= totalPages)

      const result = allCategories
        .filter(({ name }) => name.toLowerCase() !== 'uncategorized')
        .map(({ id, name, slug, parent, count }) => {
          // Find parent category slug if parent ID exists
          let parentSlug: string | undefined
          if (parent) {
            const parentCat = allCategories.find((c) => c.id === parent)
            parentSlug = parentCat?.slug
          }

          return {
            id,
            name: sanitizeTextContent(name),
            slug,
            parentSlug,
            count // WordPress count already includes children
          }
        })

      return result
    } catch (error) {
      logError(`[getCategories] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get all tags with post counts
   */
  async getTags() {
    try {
      const allTags: WpTag[] = []
      let page = 1
      let totalPages = 1

      do {
        const query = queryString.stringify({
          page,
          per_page: 100,
          hide_empty: true
        })
        const { data: tags, headers } = await wpFetch(
          this.config,
          `/tags?${query}`
        )
        allTags.push(...(tags as WpTag[]))
        totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
        page++
      } while (page <= totalPages)

      return allTags.map(({ name, slug, count }) => ({
        name: sanitizeTextContent(name),
        slug,
        count
      }))
    } catch (error) {
      logError(`[getTags] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get category path (breadcrumb trail) from root to current
   */
  async getCategoryPath(slug: string): Promise<BlogCategory[]> {
    try {
      const categories = await this.getCategories()
      const path: BlogCategory[] = []

      // Find by slug
      let current = categories.find((cat) => cat.slug === slug)
      if (!current) return []

      // Build path from child to root
      while (current) {
        path.unshift(current)
        if (current.parentSlug) {
          current = categories.find((cat) => cat.slug === current!.parentSlug)
        } else {
          current = undefined
        }
      }

      return path
    } catch (error) {
      logError(`[getCategoryPath] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get category IDs with all children (recursive)
   * Used for filtering posts by category including subcategories
   */
  async getCategoryIdsWithChildren(categorySlug: string): Promise<number[]> {
    try {
      const allCategories: WpCategory[] = []
      let page = 1
      let totalPages = 1

      do {
        const query = queryString.stringify({ per_page: 100, page })
        const { data: cats, headers } = await wpFetch(
          this.config,
          `/categories?${query}`
        )
        allCategories.push(...(cats as WpCategory[]))
        totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
        page++
      } while (page <= totalPages)

      const mainCategory = allCategories.find(
        (cat) => cat.slug === categorySlug
      )
      if (!mainCategory) return []

      const findChildIds = (parentId: number): number[] => {
        const children = allCategories.filter((cat) => cat.parent === parentId)
        const childIds = children.map(({ id }) => id)
        const grandChildIds = children.flatMap(({ id }) => findChildIds(id))
        return [...childIds, ...grandChildIds]
      }

      return [mainCategory.id, ...findChildIds(mainCategory.id)]
    } catch (error) {
      logError(`[getCategoryIdsWithChildren] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get category by ID with ACF fields
   */
  async getCategoryById(id: number): Promise<unknown | null> {
    try {
      // editContext: building ACF wysiwyg must stay raw for autop/ACFParser
      const { data: category } = await wpFetch(
        this.config,
        `/categories/${id}`,
        { editContext: true }
      )
      return category
    } catch (error) {
      logError(`[getCategoryById] ${(error as Error).message}`)
      return null
    }
  }

  /**
   * Fetch all categories with pagination, accepting arbitrary extra query params.
   * Callers are responsible for any domain-level filtering (e.g. by acf.template).
   */
  async getAllCategories(
    params: Record<string, string> = {}
  ): Promise<unknown[]> {
    const all: unknown[] = []
    let page = 1
    let totalPages = 1

    try {
      do {
        const query = queryString.stringify({
          ...params,
          page,
          per_page: 100
        })
        // editContext: building ACF wysiwyg must stay raw for autop/ACFParser
        const { data: categories, headers } = await wpFetch(
          this.config,
          `/categories?${query}`,
          { editContext: true }
        )

        all.push(...categories)

        totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
        page++
      } while (page <= totalPages)
    } catch (error) {
      logError(`[getAllCategories] ${(error as Error).message}`)
    }

    return all.map((cat) => ({
      ...(cat as Record<string, unknown>),
      name: sanitizeTextContent((cat as Record<string, unknown>).name as string)
    }))
  }

  /**
   * Get multiple categories by IDs with ACF fields
   */
  async getCategoriesByIds(ids: number[]): Promise<unknown[]> {
    if (!ids.length) return []

    // WordPress API per_page max is 100 — batch requests for large ID sets
    const chunkSize = 100
    const chunks: number[][] = []
    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize))
    }

    try {
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const query = queryString.stringify({
            include: chunk.join(','),
            per_page: chunkSize
          })
          // editContext: building ACF wysiwyg must stay raw for autop/ACFParser
          const { data: categories } = await wpFetch(
            this.config,
            `/categories?${query}`,
            { editContext: true }
          )
          return categories
        })
      )

      return (results.flat() as WpCategory[]).map((cat) => ({
        ...cat,
        name: sanitizeTextContent(cat.name)
      }))
    } catch (error) {
      logError(`[getCategoriesByIds] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get single category by slug with ACF fields
   */
  async getCategoryBySlug(slug: string): Promise<unknown | null> {
    try {
      const query = queryString.stringify({
        slug,
        _embed: 'acf:attachment'
      })
      // editContext: building ACF wysiwyg must stay raw for autop/ACFParser
      const { data: categories } = await wpFetch(
        this.config,
        `/categories?${query}`,
        { editContext: true }
      )

      if (!categories || categories.length === 0) {
        return null
      }

      const { yoast_head_json: yoast, ...category } = categories[0]

      // Resolve ACF section images if present
      await this.resolveAcfSectionsInCategory(category)

      return {
        ...category,
        name: sanitizeTextContent(category.name),
        // autop before sanitize: the raw term description separates paragraphs
        // with blank lines, and sanitizeHtmlContent collapses `\s{2,}` to a space
        // — so sanitizing first eats the breaks. autop → <p>/<br>, then sanitize.
        description: sanitizeHtmlContent(autop(category.description ?? '')),
        // Project the two SEO snippet fields out of Yoast's head blob (the rest is a
        // JSON-LD schema graph nothing here reads) and decode them for direct use as
        // <title>/<meta description>.
        yoastHead: yoast && {
          title: sanitizeTextContent(yoast.title),
          description: sanitizeTextContent(yoast.description)
        }
      }
    } catch (error) {
      logError(`[getCategoryBySlug] ${(error as Error).message}`)
      return null
    }
  }
}
