import { logError } from 'utils/log'

import { transformAuthor } from '../../transformers/wordpress'
import { type ContentAuthor } from '../../types'

import { type WordPressAuthorPayload, type WordPressConfig } from './types'
import { fetchMediaMap, wpFetch } from './utils'

/**
 * WordPress Users/Authors API methods
 * Based on: https://developer.wordpress.org/rest-api/reference/users/
 */
export class AuthorsService {
  constructor(private config: WordPressConfig) {}

  /**
   * Resolve ACF image attachment IDs to media URLs.
   * WordPress ACF image fields return a numeric attachment ID by default;
   * we batch-fetch them via /wp/v2/media to get the actual source_url.
   */
  private async resolveAcfImageIds(
    authors: WordPressAuthorPayload[]
  ): Promise<WordPressAuthorPayload[]> {
    const ids = authors
      .map((a) => a.acf?.image)
      .filter((id): id is number => typeof id === 'number' && id > 0)

    if (!ids.length) return authors

    try {
      const mediaMap = await fetchMediaMap(this.config, ids)
      return authors.map((author) => {
        const imageId = author.acf?.image
        const media =
          typeof imageId === 'number' ? mediaMap.get(imageId) : undefined
        if (!media) return author
        return { ...author, acf: { ...author.acf, image: media.source_url } }
      })
    } catch (error) {
      // Media resolution failed — proceed without WordPress photos
      logError(`[resolveAcfImageIds] ${(error as Error).message}`)
      return authors
    }
  }

  /**
   * Get a single author by ID
   * Uses WordPress REST API /wp/v2/users/{id} endpoint
   *
   * @param id - WordPress user ID
   * @returns Author information or null if not found
   */
  async getAuthor(id: string | number): Promise<ContentAuthor | null> {
    try {
      const { data: author } = await wpFetch(this.config, `/users/${id}`)
      const [enriched] = await this.resolveAcfImageIds([
        author as WordPressAuthorPayload
      ])
      return transformAuthor(enriched)
    } catch (error) {
      logError(`[getAuthor] ${(error as Error).message}`)
      return null
    }
  }

  /**
   * Get a single author by slug
   * Uses WordPress REST API /wp/v2/users?slug={slug} endpoint
   */
  async getAuthorBySlug(slug: string): Promise<ContentAuthor | null> {
    try {
      const encodedSlug = encodeURIComponent(slug)

      // Try direct slug query first
      try {
        const { data: authors } = await wpFetch(
          this.config,
          `/users?slug=${encodedSlug}`
        )

        // WordPress API returns array even for single result
        const rawAuthor =
          Array.isArray(authors) && authors.length > 0 ? authors[0] : null

        if (rawAuthor) {
          const [enriched] = await this.resolveAcfImageIds([
            rawAuthor as WordPressAuthorPayload
          ])
          return transformAuthor(enriched)
        }
      } catch (_slugError) {
        // Fallback if slug query fails
      }

      // Fallback: fetch all authors and find by slug
      // This happens when WordPress API doesn't support ?slug parameter without auth
      const allAuthors = await this.getAuthors()
      const author = allAuthors.find((a) => a.slug === slug)

      return author || null
    } catch (error) {
      logError(`[getAuthorBySlug] ${(error as Error).message}`)
      return null
    }
  }

  /**
   * Get multiple authors by IDs
   *
   * @param ids - Array of WordPress user IDs
   * @returns Array of author information
   */
  /**
   * Get all authors
   */
  async getAuthors(options?: { roles?: string[] }): Promise<ContentAuthor[]> {
    try {
      const roles = options?.roles?.join(',')
      // When authenticated, filter by role. When public (no apiKey), use
      // `who=authors` — the only endpoint WP REST API exposes without auth.
      const filterParam =
        this.config.apiKey && !this.config.wordPressComHost && roles
          ? `&roles=${roles}`
          : !this.config.apiKey
            ? '&who=authors'
            : ''
      const endpoint = `/users?per_page=100${filterParam}`

      const { data: authors } = await wpFetch(this.config, endpoint)

      const enriched = await this.resolveAcfImageIds(
        authors as WordPressAuthorPayload[]
      )

      return enriched.map((author) => transformAuthor(author))
    } catch (error) {
      // Suppress expected 401 in public mode — WordPress does not expose
      // the users endpoint without auth on some installations.
      const is401 = error instanceof Error && error.message.includes('401')
      if (!is401 || this.config.apiKey) {
        logError(`[getAuthors] ${(error as Error).message}`)
      }
      return []
    }
  }
}
