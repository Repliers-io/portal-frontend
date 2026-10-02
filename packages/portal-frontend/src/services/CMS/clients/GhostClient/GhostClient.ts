/**
 * Ghost Content API client implementing CmsClient for pages, posts and authors.
 * Wraps @tryghost/content-api, maps responses via the ghost transformers, and
 * falls back to an optional fallback client when content is missing.
 * Anatomy: docs → product-guide/cms-content/technical
 */
import GhostContentAPI from '@tryghost/content-api'

import {
  transformAuthor,
  transformPage,
  transformPost
} from '../../transformers/ghost'
import {
  type BlogCategory,
  type CmsClient,
  type CmsMenuItem,
  type ContentAuthor,
  type Page,
  type Post
} from '../../types'
import { fallbackWarning } from '../../utils/warning'

import {
  type GhostAuthorPayload,
  type GhostPostsBrowseParams,
  type GhostTagWithCount
} from './types'
import { getErrorStatusCode } from './utils'

/**
 * Ghost API client for fetching content
 */
class GhostClient implements CmsClient {
  name = 'ghost'
  private api: InstanceType<typeof GhostContentAPI>
  private fallbackClient?: CmsClient

  constructor(
    url: string,
    key: string,
    fallbackClient?: CmsClient,
    version: string = 'v5.0'
  ) {
    this.api = new GhostContentAPI({
      url,
      key,
      version
    })
    this.fallbackClient = fallbackClient
  }

  /**
   * Get a single page by slug
   */
  async getPage(slug: string): Promise<Page | null> {
    if (!this.api) {
      return null
    }

    try {
      const page = await this.api.pages.read({ slug })
      return transformPage(page)
    } catch (error) {
      console.error(`Error fetching page with slug "${slug}":`, error)
      // Page not found, try markdown fallback if available
      if (this.fallbackClient) {
        const markdownPage = await this.fallbackClient.getPage(slug)
        if (markdownPage) {
          fallbackWarning(slug)
          return markdownPage
        }
      }

      if (getErrorStatusCode(error) !== 404) {
        throw error
      }

      return null
    }
  }

  /**
   * Get all pages
   */
  async getPages(): Promise<Page[]> {
    if (!this.api) return []

    try {
      const pages = await this.api.pages.browse({
        limit: 'all'
      })
      return pages.map((page) => transformPage(page))
    } catch (error) {
      console.error('Error fetching pages from Ghost:', error)
      return []
    }
  }

  /**
   * Get a single post by slug
   */
  async getPost(slug: string): Promise<Post | null> {
    if (!this.api) {
      return null
    }

    try {
      const post = await this.api.posts.read(
        { slug },
        {
          include: ['tags', 'authors']
        }
      )
      return transformPost(post)
    } catch (error) {
      console.error(`Error fetching post with slug "${slug}":`, error)

      if (getErrorStatusCode(error) !== 404) {
        throw error
      }

      return null
    }
  }

  /**
   * Get total count of posts (for pagination)
   */
  async getTotalPosts(options?: {
    category?: string
    tag?: string
  }): Promise<number> {
    if (!this.api) return 0

    try {
      const params: GhostPostsBrowseParams = {
        limit: 1,
        include: []
      }

      // Build filter string
      const filters: string[] = []
      if (options?.tag) {
        filters.push(`tag:${options.tag}`)
      }
      if (options?.category) {
        filters.push(`tag:${options.category}`)
      }
      if (filters.length > 0) {
        params.filter = filters.join('+')
      }

      const response = await this.api.posts.browse(params)
      return response.meta?.pagination?.total || 0
    } catch (error) {
      console.error('Error fetching total posts count:', error)
      throw error
    }
  }

  /**
   * Get all posts with optional filters
   */
  async getPosts(options?: {
    limit?: number
    offset?: number
    category?: string
    tag?: string
    author?: string | number
  }): Promise<Post[]> {
    if (!this.api) return []

    try {
      const params: GhostPostsBrowseParams = {
        limit: options?.limit === 9999 ? 'all' : options?.limit || 15,
        include: ['tags', 'authors'],
        order: 'published_at DESC'
      }

      // Ghost uses page instead of offset
      if (options?.offset) {
        const page = Math.floor(options.offset / (options.limit || 15)) + 1
        params.page = page
      }

      // Build filter string
      const filters: string[] = []
      if (options?.tag) {
        filters.push(`tag:${options.tag}`)
      }
      if (options?.category) {
        filters.push(`tag:${options.category}`)
      }
      if (filters.length > 0) {
        params.filter = filters.join('+')
      }

      const posts = await this.api.posts.browse(params)
      return posts.map((post) => transformPost(post))
    } catch (error) {
      console.error('Error fetching posts from Ghost:', error)
      throw error
    }
  }

  /**
   * Generate static paths for SSG (pages)
   */
  async getPagePaths(): Promise<string[]> {
    if (!this.api) return []

    try {
      const pages = await this.api.pages.browse({
        limit: 'all',
        fields: ['slug']
      })
      return pages.map((page) => page.slug)
    } catch (error) {
      console.error('Error fetching page slugs from Ghost:', error)
      return []
    }
  }

  /**
   * Generate static paths for SSG (posts)
   */
  async getPostPaths(): Promise<string[]> {
    if (!this.api) return []

    try {
      const posts = await this.api.posts.browse({
        limit: 'all',
        fields: ['slug']
      })
      return posts.map((post) => post.slug)
    } catch (error) {
      console.error('Error fetching post slugs from Ghost:', error)
      return []
    }
  }

  /**
   * Get all categories
   * NOTE: Ghost doesn't support hierarchical categories
   */
  async getCategories() {
    return []
  }

  /**
   * Get all tags with post counts
   */
  async getTags() {
    if (!this.api) return []

    try {
      const tags = await this.api.tags.browse({
        limit: 'all',
        include: ['count.posts'],
        filter: 'visibility:public'
      })

      return tags
        .filter((tag: GhostTagWithCount) => (tag.count?.posts || 0) > 0)
        .map(({ name, slug, count }) => ({
          name: name || '',
          slug,
          count: count?.posts || 0
        }))
    } catch (error) {
      console.error('Error fetching tags from Ghost:', error)
      return []
    }
  }

  /**
   * Get category path
   * NOTE: Ghost doesn't support hierarchical categories
   */
  async getCategoryPath(_slug: string): Promise<BlogCategory[]> {
    return []
  }

  /**
   * Get category by slug
   * NOTE: Ghost doesn't support categories
   */
  async getCategoryBySlug(_slug: string): Promise<BlogCategory | null> {
    return null
  }

  /**
   * Get menu items by location
   * NOTE: Ghost doesn't support menus via API
   */
  async getMenu(_location: string): Promise<CmsMenuItem[]> {
    return []
  }

  /**
   * Get menu by slug
   * NOTE: Ghost doesn't support menus via API
   */
  async getMenuBySlug(_slug: string): Promise<CmsMenuItem[]> {
    return []
  }

  /**
   * Get all menu slugs
   * NOTE: Ghost doesn't support menus via API
   */
  async getMenuSlugs(): Promise<string[]> {
    return []
  }

  /**
   * Get a single author by ID
   * Ghost Content API: https://ghost.org/docs/content-api/#authors
   */
  async getAuthor(id: string | number): Promise<ContentAuthor | null> {
    if (!this.api) return null

    try {
      const author = await this.api.authors.read({ id: String(id) })
      return transformAuthor(author as GhostAuthorPayload)
    } catch (error) {
      console.error(`Error fetching author ${id} from Ghost:`, error)
      return null
    }
  }

  /**
   * Get a single author by slug
   * Ghost Content API supports read by slug
   */
  async getAuthorBySlug(slug: string): Promise<ContentAuthor | null> {
    if (!this.api) return null

    try {
      const author = await this.api.authors.read({ slug })
      return transformAuthor(author as GhostAuthorPayload)
    } catch (error) {
      console.error(`Error fetching author by slug ${slug} from Ghost:`, error)

      if (getErrorStatusCode(error) !== 404) {
        throw error
      }

      return null
    }
  }

  /**
   * Get all authors
   */
  async getAuthors(_options?: { roles?: string[] }): Promise<ContentAuthor[]> {
    if (!this.api) return []

    try {
      const authors = await this.api.authors.browse({ limit: 'all' })
      return authors.map((author) =>
        transformAuthor(author as GhostAuthorPayload)
      )
    } catch (error) {
      console.error('Error fetching authors from Ghost:', error)
      return []
    }
  }
}

export { GhostClient }
