import { logError } from 'utils/log'

import { type WordPressConfig, type WpMediaItem } from './types'
import { fetchMediaMap, wpFetch } from './utils'

/**
 * WordPress Media API methods
 */
export class MediaService {
  constructor(private config: WordPressConfig) {}

  /**
   * Get media item by ID
   */
  async getMediaById(id: number): Promise<unknown | null> {
    try {
      const { data: media } = await wpFetch(this.config, `/media/${id}`)
      return media
    } catch (error) {
      logError(`[getMediaById] ${(error as Error).message}`)
      return null
    }
  }

  /**
   * Get multiple media items by IDs
   */
  async getMediaByIds(ids: number[]): Promise<WpMediaItem[]> {
    if (!ids.length) return []
    try {
      const map = await fetchMediaMap(this.config, ids)
      return Array.from(map.values())
    } catch (error) {
      logError(`[getMediaByIds] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Build an id→item map for the given attachment IDs
   */
  async buildMediaMap(ids: number[]): Promise<Map<number, WpMediaItem>> {
    return fetchMediaMap(this.config, ids)
  }

  /**
   * Extract image URLs from media items
   */
  getImageUrls(
    mediaItems: WpMediaItem[],
    size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'
  ): string[] {
    return mediaItems
      .map((media) => {
        // Try to get specific size
        const sizedUrl = media.media_details?.sizes?.[size]?.source_url
        if (sizedUrl) return sizedUrl

        // Fallback to full size
        return media.source_url || media.guid?.rendered
      })
      .filter((url): url is string => Boolean(url))
  }
}
