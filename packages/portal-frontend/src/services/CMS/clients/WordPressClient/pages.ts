import queryString from 'query-string'

import { logError } from 'utils/log'

import { transformPage } from '../../transformers/wordpress'
import { type CmsClient, type Page } from '../../types'
import { fallbackWarning } from '../../utils/warning'

import { type WordPressConfig } from './types'
import { fetchAllPaths, wpFetch } from './utils'

/**
 * WordPress Pages API methods
 */
export class PagesService {
  constructor(
    private config: WordPressConfig,
    private fallbackClient?: CmsClient
  ) {}

  /**
   * Get a single page by slug
   * Note: WordPress slugs are flat (last segment only), so we extract it from nested paths
   */
  async getPage(slug: string): Promise<Page | null> {
    try {
      // WordPress slugs are flat - extract last segment for nested paths like "buy/seattle-home-buying-class"
      const wpSlug = slug.split('/').at(-1) ?? slug
      const query = queryString.stringify({ slug: wpSlug, _embed: true })
      // editContext: needs content.raw (rendered via 'raw' format in StaticPageContent)
      const { data: pages } = await wpFetch(this.config, `/pages?${query}`, {
        editContext: true
      })

      if (pages.length === 0) {
        // Page not found, try markdown fallback if available
        if (this.fallbackClient) {
          const markdownPage = await this.fallbackClient.getPage(slug)
          if (markdownPage) {
            fallbackWarning(slug)
            return markdownPage
          }
        }
        return null
      }

      // When multiple pages share the same flat slug (e.g. /guides/overview and /buy/overview),
      // pick the one whose full path matches the requested path.
      const transformed: Page[] = pages.map((p: any) =>
        transformPage(p, this.config.baseUrl)
      )
      const requestedPath = `/${slug}`
      return transformed.find((p) => p.path === requestedPath) ?? transformed[0]
    } catch (error) {
      logError(`[getPage] ${(error as Error).message}`)
      if (this.fallbackClient) {
        const markdownPage = await this.fallbackClient.getPage(slug)
        if (markdownPage) {
          fallbackWarning(slug)
          return markdownPage
        }
      }
      return null
    }
  }

  /**
   * Get all pages
   */
  async getPages(): Promise<Page[]> {
    try {
      const allPages: any[] = []
      let page = 1
      let totalPages = 1

      do {
        const query = queryString.stringify({
          per_page: 25, // Reduced to fit in Next.js 2MB cache limit (~2.9MB with 50 items)
          page,
          _embed: true
        })
        const { data: pages, headers } = await wpFetch(
          this.config,
          `/pages?${query}`
        )
        allPages.push(...pages)
        totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
        page++
      } while (page <= totalPages)

      const parentIds = new Set(allPages.map((p) => p.parent).filter(Boolean))

      const transformed = allPages.map((p) =>
        transformPage(p, this.config.baseUrl)
      )
      const result = transformed
        .map((p, i) => ({
          ...p,
          folder: parentIds.has(Number(allPages[i].id))
        }))
        .sort((a, b) => (a.folder === b.folder ? 0 : a.folder ? -1 : 1))

      return result
    } catch (error) {
      logError(`[getPages] ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Generate static paths for SSG (pages)
   */
  async getPagePaths(): Promise<string[]> {
    try {
      return await fetchAllPaths(this.config, '/pages')
    } catch {
      return []
    }
  }
}
