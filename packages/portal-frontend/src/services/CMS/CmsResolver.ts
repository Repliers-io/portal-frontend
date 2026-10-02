/**
 * Decides whether a route's content is served local vs remote using `@configs/cms`.
 * Applies the strategy per slug (localOnly/remoteOnly/remoteFirst) with resolution
 * priority: exact match → wildcard patterns (longest first) → default '*'.
 * Anatomy: docs → product-guide/cms-content/technical
 */
import { cmsRoutingConfig } from '@configs/cms'

import type { MarkdownClient } from './clients/MarkdownClient'
import type { CmsClient, CmsFetchStrategy, Page } from './types'

type CmsResolvedSource = 'local' | 'remote'

/**
 * CMS Resolver - determines content source based on configuration
 *
 * Resolution priority:
 * 1. Exact match (highest)
 * 2. Wildcard patterns (longer patterns first)
 * 3. Default '*' (lowest)
 */
export class CmsResolver {
  constructor(
    private localClient: CmsClient,
    private remoteClient: CmsClient | null
  ) {}

  /**
   * Resolve fetch strategy for a given slug
   */
  private getStrategy(slug: string): CmsFetchStrategy {
    const { pages } = cmsRoutingConfig

    // 1. Exact match
    if (pages[slug]) {
      return pages[slug]
    }

    // 2. Wildcard patterns (longer patterns first)
    const patterns = Object.keys(pages)
      .filter((key) => key.includes('*') && key !== '*')
      .sort((a, b) => b.length - a.length)

    for (const pattern of patterns) {
      if (this.matchPattern(slug, pattern)) {
        return pages[pattern]
      }
    }

    // 3. Default
    if (pages['*']) {
      return pages['*']
    }

    return 'remoteFirst'
  }

  /**
   * Simple pattern matching: 'blog/*' matches 'blog/post-1'
   */
  private matchPattern(slug: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return regex.test(slug)
  }

  /**
   * Log resolution result
   */
  private log(
    slug: string,
    strategy: CmsFetchStrategy,
    source: CmsResolvedSource,
    fallback: boolean = false
  ): void {
    if (!cmsRoutingConfig.debug) return

    const fallbackText = fallback ? ' (fallback)' : ''

    // eslint-disable-next-line no-console
    console.log(
      `■ [CMS Route]: ${slug} → ${strategy} → ${source}${fallbackText}`
    )
  }

  /**
   * Merge local meta.json fields (if any) onto a remote page.
   * Only defined fields from meta override the remote values.
   */
  private async applyLocalMeta(slug: string, page: Page): Promise<Page> {
    const client = this.localClient as Partial<MarkdownClient>
    if (typeof client.getPageMeta !== 'function') return page
    const meta = await client.getPageMeta(slug)
    if (!meta) return page
    return { ...page, ...meta }
  }

  /**
   * Get page from the appropriate source based on fetch strategy
   */
  async getPage(slug: string): Promise<Page | null> {
    const strategy = this.getStrategy(slug)

    switch (strategy) {
      case 'localOnly': {
        const page = await this.localClient.getPage(slug)
        this.log(slug, strategy, 'local')
        return page
      }

      case 'remoteOnly': {
        const page = (await this.remoteClient?.getPage(slug)) ?? null
        this.log(slug, strategy, 'remote')
        if (!page) return null
        return this.applyLocalMeta(slug, page)
      }

      case 'remoteFirst': {
        const page = await this.remoteClient?.getPage(slug)
        if (page) {
          this.log(slug, strategy, 'remote')
          return this.applyLocalMeta(slug, page)
        }

        const localPage = await this.localClient.getPage(slug)
        this.log(slug, strategy, 'local', true)
        return localPage
      }
    }
  }
}
