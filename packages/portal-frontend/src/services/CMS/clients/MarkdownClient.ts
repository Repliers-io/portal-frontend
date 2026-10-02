/**
 * Local Markdown CMS client implementing CmsClient for file-based content.
 * Resolves pages by slug from per-tenant `content/<config>/…` (with defaults
 * fallback), loading meta.json and Markdown.mdx modules at request time.
 * Anatomy: docs → product-guide/cms-content/technical
 */
import content from '@configs/content'

import { logError } from 'utils/log'

import {
  type BlogCategory,
  type CmsClient,
  type CmsMenuItem,
  type ContentAuthor,
  type Page,
  type Post
} from '../types'

// Resolve the active tenant WITHOUT a literal the bundler can fold to a constant. A constant tenant
// makes Turbopack build each dynamic content import over a single `content/<tenant>/` dir — empty
// for tenants that ship Markdown.mdx but no meta.json — and the build fails. The computed key
// (bundlers don't fold `.join`) keeps `config` a runtime value, so imports glob content/*/*
// (non-empty via defaults) and the tenant/defaults file is chosen at request time.
const config =
  process.env[['NEXT_PUBLIC', 'APP', 'CONFIGURATION'].join('_')] || 'defaults'

/**
 * Markdown content client for local file-based content
 */
class MarkdownClient implements CmsClient {
  name = 'markdown'

  constructor() {
    // No initialization needed for markdown client
  }

  /**
   * Get all available page slugs (internal helper)
   */
  private async getPageSlugs(): Promise<string[]> {
    // Get slugs from content config
    return content.staticPageSlugs || []
  }

  /**
   * Get only meta.json for a slug (without requiring Markdown.mdx).
   * Returns null if no meta.json exists for this slug.
   */
  async getPageMeta(slug: string): Promise<Partial<Page> | null> {
    try {
      const mod = await import(`content/${config}/${slug}/meta.json`).catch(
        async () => import(`content/defaults/${slug}/meta.json`)
      )
      return mod.default ?? mod
    } catch {
      return null
    }
  }

  /**
   * Get a single page by slug
   */
  async getPage(slug: string): Promise<Page | null> {
    try {
      const meta = await import(`content/${config}/${slug}/meta.json`).catch(
        async () => import(`content/defaults/${slug}/meta.json`)
      )

      const cnt = await import(`content/${config}/${slug}/Markdown.mdx`)
        .catch(async () => import(`content/defaults/${slug}/Markdown.mdx`))
        .catch(() => null)

      // meta-only (no MDX) — used as a local override for remote pages
      if (!cnt) return null

      // Transform to Page interface
      return {
        slug,
        id: slug,
        path: '/' + slug,
        type: 'page',
        status: 'published',
        content: cnt.default,
        ...meta,
        publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : new Date(),
        updatedAt: meta.updatedAt ? new Date(meta.updatedAt) : new Date()
      }
    } catch (error) {
      logError(`Error loading page with slug "${slug}":`, error)
      return null
    }
  }

  /**
   * Get all pages
   */
  async getPages(): Promise<Page[]> {
    try {
      const slugs = await this.getPageSlugs()
      const pages = await Promise.all(
        slugs.map(async (slug) => {
          return this.getPage(slug)
        })
      )
      return pages.filter((page): page is Page => page !== null)
    } catch (error) {
      logError('Error fetching pages from Markdown:', error)
      return []
    }
  }

  /**
   * Get a single post by slug
   * NOTE: MarkdownClient is for pages only. Posts must come from external CMS.
   */
  async getPost(_slug: string): Promise<Post | null> {
    return null
  }

  /**
   * Get all posts
   * NOTE: MarkdownClient is for pages only. Posts must come from external CMS.
   */
  async getPosts(_options?: {
    limit?: number
    offset?: number
    category?: string
    tag?: string
    author?: string | number
  }): Promise<Post[]> {
    return []
  }

  /**
   * Get total count of posts (for pagination)
   * NOTE: MarkdownClient is for pages only. Posts must come from external CMS.
   */
  async getTotalPosts(_options?: {
    category?: string
    tag?: string
  }): Promise<number> {
    return 0
  }

  /**
   * Generate static paths for SSG (pages)
   */
  async getPagePaths(): Promise<string[]> {
    return this.getPageSlugs()
  }

  /**
   * Generate static paths for SSG (posts)
   * NOTE: MarkdownClient is for pages only. Posts must come from external CMS.
   */
  async getPostPaths(): Promise<string[]> {
    return []
  }

  /**
   * Get all categories
   * NOTE: MarkdownClient is for pages only. Categories must come from external CMS.
   */
  async getCategories() {
    return []
  }

  /**
   * Get all tags
   * NOTE: MarkdownClient is for pages only. Tags must come from external CMS.
   */
  async getTags() {
    return []
  }

  /**
   * Get category path (breadcrumb trail)
   * NOTE: Markdown doesn't support hierarchical categories
   */
  async getCategoryPath(_slug: string): Promise<BlogCategory[]> {
    return []
  }

  /**
   * Get category by slug
   * NOTE: Markdown doesn't support categories
   */
  async getCategoryBySlug(_slug: string): Promise<BlogCategory | null> {
    return null
  }

  /**
   * Get menu by location
   * NOTE: Markdown doesn't support menus
   */
  async getMenu(_location: string): Promise<CmsMenuItem[]> {
    return []
  }

  /**
   * Get menu by slug
   * NOTE: Markdown doesn't support menus
   */
  async getMenuBySlug(_slug: string): Promise<CmsMenuItem[]> {
    return []
  }

  /**
   * Get all menu slugs
   * NOTE: Markdown doesn't support menus
   */
  async getMenuSlugs(): Promise<string[]> {
    return []
  }

  /**
   * Get a single author by ID
   * NOTE: Markdown doesn't support authors
   */
  async getAuthor(_id: string | number): Promise<ContentAuthor | null> {
    return null
  }

  /**
   * Get a single author by slug
   * NOTE: Markdown doesn't support authors
   */
  async getAuthorBySlug(_slug: string): Promise<ContentAuthor | null> {
    return null
  }

  /**
   * Get all authors
   * NOTE: Markdown doesn't support authors
   */
  async getAuthors(_options?: { roles?: string[] }): Promise<ContentAuthor[]> {
    return []
  }
}

export { MarkdownClient }
