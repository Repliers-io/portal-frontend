import queryString from 'query-string'

import { transformPost } from '../../transformers/wordpress'
import { type Post } from '../../types'

import { MediaService } from './media'
import { type WordPressConfig } from './types'
import { wpFetch } from './utils'

/**
 * WordPress custom post type slug (configured per instance in configs/[instance]/blog.ts)
 * Common examples: 'news', 'review', 'sale', 'buildings', 'portfolio', 'team', etc.
 *
 * @example
 * // In configs/urbn/blog.ts:
 * customPostTypes: ['news', 'review', 'sale', 'buildings'] as const
 */
export type CustomPostType = string

/**
 * WordPress Custom Post Types API methods
 * Universal service for fetching custom post types from WordPress
 */
export class CustomPostsService {
  private mediaService: MediaService

  constructor(private config: WordPressConfig) {
    this.mediaService = new MediaService(config)
  }

  /**
   * Resolve ACF source_image field by attaching media data to posts
   */
  private async resolveAcfImages(posts: unknown[]): Promise<unknown[]> {
    // Collect all source_image IDs that need resolving
    const imageIds = new Set<number>()
    const postsNeedingImages = posts.filter((post) => {
      if (!post || typeof post !== 'object') return false
      const postObj = post as Record<string, unknown>
      const sourceImageId = (postObj.acf as Record<string, unknown> | undefined)
        ?.source_image
      const hasEmbedded = (
        postObj._embedded as Record<string, unknown> | undefined
      )?.['wp:featuredmedia']

      if (typeof sourceImageId === 'number' && !hasEmbedded) {
        imageIds.add(sourceImageId)
        return true
      }
      return false
    })

    if (imageIds.size === 0) return posts

    // Fetch and map media items
    const mediaItems = await this.mediaService.getMediaByIds([...imageIds])
    const mediaMap = new Map(
      mediaItems.map((media) => [
        (media as unknown as Record<string, unknown>).id,
        media
      ])
    )

    // Attach media to posts
    postsNeedingImages.forEach((post) => {
      const postObj = post as Record<string, unknown>
      const sourceImageId = (postObj.acf as Record<string, unknown>)
        .source_image as number
      const media = mediaMap.get(sourceImageId)

      if (media) {
        if (!postObj._embedded) postObj._embedded = {}
        ;(postObj._embedded as Record<string, unknown>)['wp:featuredmedia'] = [
          media
        ]
      }
    })

    return posts
  }

  /**
   * Get a single custom post by slug and type
   */
  async getCustomPost(
    postType: CustomPostType,
    slug: string
  ): Promise<Post | null> {
    try {
      const query = queryString.stringify({ slug, _embed: true })
      // editContext: single custom post renders content.raw, like getPost/getPage
      const { data: posts } = await wpFetch(
        this.config,
        `/${postType}?${query}`,
        { editContext: true }
      )
      if (posts.length === 0) return null

      // Resolve ACF source_image fields
      const postsWithImages = await this.resolveAcfImages(posts)
      return transformPost(postsWithImages[0], this.config.baseUrl)
    } catch {
      return null
    }
  }

  /**
   * Get total count of custom posts (for pagination)
   */
  async getTotalCustomPosts(
    postType: CustomPostType,
    _options?: {
      category?: string
      tag?: string
    }
  ): Promise<number> {
    try {
      // TODO: Add category/tag support when needed
      const query = queryString.stringify(
        {
          per_page: 1
        },
        { skipNull: true }
      )

      const { headers } = await wpFetch(this.config, `/${postType}?${query}`)

      // WordPress returns total count in X-WP-Total header
      const total = headers.get('X-WP-Total')
      return total ? parseInt(total, 10) : 0
    } catch {
      return 0
    }
  }

  /**
   * Get all custom posts with optional filters
   */
  async getCustomPosts(
    postType: CustomPostType,
    options?: {
      limit?: number
      offset?: number
      category?: string
      tag?: string
      author?: string | number
    }
  ): Promise<Post[]> {
    try {
      // TODO: Add category/tag support when needed
      const query = queryString.stringify(
        {
          per_page: options?.limit,
          offset: options?.offset,
          author: options?.author,
          _embed: true
        },
        { skipNull: true, skipEmptyString: true, arrayFormat: 'comma' }
      )

      const { data: posts } = await wpFetch(
        this.config,
        `/${postType}?${query}`
      )

      // Resolve ACF source_image fields
      const postsWithImages = await this.resolveAcfImages(posts)
      return postsWithImages.map((post: unknown) =>
        transformPost(post, this.config.baseUrl)
      )
    } catch {
      return []
    }
  }

  /**
   * Search custom posts
   */
  async searchCustomPosts(
    postType: CustomPostType,
    search: string,
    options: { limit?: number } = {}
  ): Promise<Post[]> {
    try {
      const query = queryString.stringify({
        per_page: options.limit,
        search,
        _embed: true
      })

      const { data: posts } = await wpFetch(
        this.config,
        `/${postType}?${query}`
      )

      // Resolve ACF source_image fields
      const postsWithImages = await this.resolveAcfImages(posts)
      return postsWithImages.map((post: unknown) =>
        transformPost(post, this.config.baseUrl)
      )
    } catch {
      return []
    }
  }

  async getCustomPostsByAuthor(
    postType: CustomPostType,
    authorId: string,
    { limit = 12 }: { limit?: number } = {}
  ): Promise<Post[]> {
    const authorPosts: Post[] = []
    let offset = 0

    while (authorPosts.length < limit && offset < 500) {
      const batch = await this.getCustomPosts(postType, { limit: 100, offset })
      if (!batch.length) break

      authorPosts.push(...batch.filter((post) => post.author?.id === authorId))
      offset += 100

      if (batch.length < 100) break
    }

    return authorPosts.slice(0, limit)
  }
}
