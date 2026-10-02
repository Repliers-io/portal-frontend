import queryString from 'query-string'

import { logError } from 'utils/log'

import { transformPost } from '../../transformers/wordpress'
import { type Post } from '../../types'

import { type WordPressConfig } from './types'
import { fetchAllSlugs, fetchMediaMap, wpFetch } from './utils'

/**
 * Fields needed to render post cards (index lists, prev/next navigation, similar posts).
 * Deliberately excludes:
 *  - full `content` — only single-post pages need it (fetched in getPost)
 *  - `yoast_head_json` — heavy SEO blob only consumed by the single post's <head>
 * Keeping payloads small lets these list responses fit the Next.js 2MB fetch-cache limit.
 * `_links` must stay: without it WordPress skips embedding wp:featuredmedia.
 */
const cardFields =
  'id,title,excerpt,date,modified,slug,status,featured_media,_embedded,_links,acf'

/**
 * WordPress Posts API methods
 */
export class PostsService {
  constructor(
    private config: WordPressConfig,
    private taxonomiesService: {
      getCategoryIdsWithChildren: (slug: string) => Promise<number[]>
    }
  ) {}

  /**
   * Resolve ACF image IDs in embedded authors before post transformation.
   * Posts fetched with _embed contain raw author data where acf.image is
   * still a numeric attachment ID — same resolution needed as in AuthorsService.
   */
  private async resolveEmbeddedAuthorImages(
    rawPosts: unknown[]
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getAcf = (post: unknown) => (post as any)?._embedded?.author?.[0]?.acf

    const ids = rawPosts
      .map((p) => getAcf(p)?.image)
      .filter((id): id is number => typeof id === 'number' && id > 0)

    if (!ids.length) return

    try {
      const mediaMap = await fetchMediaMap(this.config, ids)
      for (const post of rawPosts) {
        const acf = getAcf(post)
        if (acf && typeof acf.image === 'number' && mediaMap.has(acf.image)) {
          acf.image = mediaMap.get(acf.image)!.source_url
        }
      }
    } catch {
      // non-critical — posts will render without author photos
    }
  }

  /**
   * Resolve ACF gallery attachment IDs to image objects
   */
  private async resolveGalleryInPost(post: Post): Promise<void> {
    if (
      !post.acf?.gallery ||
      !Array.isArray(post.acf.gallery) ||
      typeof post.acf.gallery[0] !== 'number'
    ) {
      return
    }

    try {
      const mediaMap = await fetchMediaMap(
        this.config,
        post.acf.gallery as number[]
      )

      post.acf.gallery = (post.acf.gallery as number[])
        .map((id: number) => {
          const media = mediaMap.get(id)
          return media
            ? {
                url:
                  media.source_url ||
                  media.media_details?.sizes?.large?.source_url,
                alt: media.alt_text,
                width: media.media_details?.width,
                height: media.media_details?.height
              }
            : null
        })
        .filter(Boolean)
    } catch (error) {
      logError(`[resolveGalleryInPost] ${(error as Error).message}`)
    }
  }

  /**
   * Get a single post by slug
   */
  async getPost(slug: string): Promise<Post | null> {
    try {
      const query = queryString.stringify({
        slug,
        _embed: true
      })
      // editContext: needs content.raw (rendered via 'raw' format in BlogPostContent)
      const { data: posts } = await wpFetch(this.config, `/posts?${query}`, {
        editContext: true
      })
      if (posts.length === 0) return null

      await this.resolveEmbeddedAuthorImages(posts)
      const post = transformPost(posts[0], this.config.baseUrl)

      // Resolve ACF gallery if present
      await this.resolveGalleryInPost(post)

      return post
    } catch (error) {
      logError(`[getPost] ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Get total count of posts (for pagination)
   */
  async getTotalPosts({
    category,
    tag
  }: {
    category?: string
    tag?: string
  } = {}): Promise<number> {
    try {
      let categoryIds: number[] = []
      let tagId: number | undefined

      // If category slug is provided, fetch the category ID and all child categories
      if (category) {
        const slug = decodeURIComponent(category)
        categoryIds =
          await this.taxonomiesService.getCategoryIdsWithChildren(slug)
      }

      // If tag slug is provided, fetch the tag ID
      if (tag) {
        const slug = decodeURIComponent(tag)
        const query = queryString.stringify({ slug }, { skipNull: true })
        const { data: tags } = await wpFetch(this.config, `/tags?${query}`)
        tagId = tags[0]?.id
      }

      const query = queryString.stringify(
        {
          per_page: 1,
          categories: categoryIds.length ? categoryIds : undefined,
          tags: tagId
        },
        { skipNull: true }
      )

      const { headers } = await wpFetch(this.config, `/posts?${query}`)

      // WordPress returns total count in X-WP-Total header
      const total = headers.get('X-WP-Total')
      return total ? parseInt(total, 10) : 0
    } catch (error) {
      logError(`[getTotalPosts] ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Get all posts with optional filters
   */
  async getPosts({
    limit,
    offset,
    author,
    category,
    tag
  }: {
    limit?: number
    offset?: number
    author?: string | number
    category?: string
    tag?: string
  } = {}): Promise<Post[]> {
    try {
      let categoryIds: number[] = []
      let tagId: number | undefined

      // If category slug is provided, fetch the category ID and all child categories
      if (category) {
        const slug = decodeURIComponent(category)
        categoryIds =
          await this.taxonomiesService.getCategoryIdsWithChildren(slug)
      }

      // If tag slug is provided, fetch the tag ID
      if (tag) {
        const slug = decodeURIComponent(tag)
        const query = queryString.stringify({ slug }, { skipNull: true })
        const { data: tags } = await wpFetch(this.config, `/tags?${query}`)
        tagId = tags[0]?.id
      }

      const query = queryString.stringify(
        {
          per_page: limit,
          offset,
          categories: categoryIds.length ? categoryIds : undefined,
          tags: tagId,
          author,
          _embed: true,
          _fields: cardFields
        },
        {
          skipNull: true,
          skipEmptyString: true,
          arrayFormat: 'comma'
        }
      )

      const { data: posts } = await wpFetch(this.config, `/posts?${query}`)
      await this.resolveEmbeddedAuthorImages(posts)
      return posts.map((post: unknown) =>
        transformPost(post, this.config.baseUrl)
      )
    } catch (error) {
      logError(`[getPosts] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get posts related to the given post by shared taxonomy (for "similar posts").
   *
   * WordPress AND-combines `categories` + `tags` in a single request, but we want OR
   * semantics (shares a category OR a tag), so each taxonomy is queried separately and
   * the pools merged + de-duplicated. Ordering/scoring is left to the caller
   * (findSimilarPosts): WP returns date-desc, so `poolSize` caps how many recent
   * same-category/-tag posts are considered.
   */
  async getRelatedPosts(
    post: Post,
    { poolSize = 10 }: { poolSize?: number } = {}
  ): Promise<Post[]> {
    const categoryIds = (post.categories ?? []).map((c) => c.id).filter(Boolean)
    const tagIds = (post.tags ?? []).map((t) => t.id).filter(Boolean)
    if (!categoryIds.length && !tagIds.length) return []

    const taxonomyFilters: Record<string, string>[] = []
    if (categoryIds.length) {
      taxonomyFilters.push({ categories: categoryIds.join(',') })
    }
    if (tagIds.length) taxonomyFilters.push({ tags: tagIds.join(',') })

    const pools = await Promise.all(
      taxonomyFilters.map(async (filter) => {
        const query = queryString.stringify({
          ...filter,
          per_page: poolSize,
          _embed: true,
          _fields: cardFields
        })
        const { data } = await wpFetch(this.config, `/posts?${query}`)
        return Array.isArray(data) ? data : []
      })
    )

    // De-duplicate raw posts (a post can match both a category and a tag) and drop the
    // current post before transforming.
    const uniqueRaw = new Map<number, unknown>()
    for (const raw of pools.flat()) {
      const id = (raw as { id?: number })?.id
      if (typeof id === 'number' && String(id) !== post.id) {
        uniqueRaw.set(id, raw)
      }
    }

    const rawPosts = [...uniqueRaw.values()]
    await this.resolveEmbeddedAuthorImages(rawPosts)
    return rawPosts.map((raw) => transformPost(raw, this.config.baseUrl))
  }

  /**
   * Generate static paths for SSG (posts)
   */
  async getPostPaths(): Promise<string[]> {
    try {
      return await fetchAllSlugs(this.config, '/posts')
    } catch {
      return []
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(
    categoryId: string,
    { limit, page }: { limit?: number; page?: number } = {}
  ) {
    const query = queryString.stringify({
      per_page: limit,
      page,
      categories: categoryId,
      _embed: true,
      _fields: cardFields
    })

    const { data: posts } = await wpFetch(this.config, `/posts?${query}`)
    return posts
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(
    tagId: string,
    { limit, page }: { limit?: number; page?: number } = {}
  ) {
    const query = queryString.stringify({
      per_page: limit,
      page,
      tags: tagId,
      _embed: true,
      _fields: cardFields
    })

    const { data: posts } = await wpFetch(this.config, `/posts?${query}`)
    return posts
  }

  /**
   * Search posts
   */
  async searchPosts(search: string, { limit }: { limit?: number } = {}) {
    const query = queryString.stringify({
      per_page: limit,
      search,
      _embed: true,
      _fields: cardFields
    })

    const { data: posts } = await wpFetch(this.config, `/posts?${query}`)
    return posts
  }

  async getPostsByAuthor(
    authorId: string,
    { limit = 12 }: { limit?: number } = {}
  ): Promise<Post[]> {
    const authorPosts: Post[] = []
    let offset = 0

    while (authorPosts.length < limit && offset < 500) {
      const batch = await this.getPosts({ limit: 100, offset })
      if (!batch.length) break

      authorPosts.push(...batch.filter((post) => post.author?.id === authorId))
      offset += 100

      if (batch.length < 100) break
    }

    return authorPosts.slice(0, limit)
  }
}
