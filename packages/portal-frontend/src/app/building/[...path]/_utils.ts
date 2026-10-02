import blogConfig from '@configs/blog'

import CmsService, { type WordPressClient } from 'services/CMS'
import { type WpMediaItem } from 'services/CMS/clients/WordPressClient/types'
import { logError } from 'utils/log'

type WpBuildingCategory = {
  id: number
  acf?: { slideshow?: number[]; sections?: Array<{ related?: number[] }> }
}

/**
 * Fetch building by slug with ACF fields
 */
export async function fetchBuilding(slug: string) {
  const wpClient = CmsService.getBlogClient() as WordPressClient
  return wpClient.getCategoryBySlug(slug)
}

/**
 * Fetch related buildings with their first media item
 */
export async function fetchRelatedBuildings(building: WpBuildingCategory) {
  const relatedIds =
    building.acf?.sections
      ?.flatMap((section) => section.related || [])
      .filter(Boolean) || []

  if (relatedIds.length === 0) {
    return []
  }

  try {
    const wpClient = CmsService.getBlogClient() as WordPressClient
    const relatedBuildings = (await wpClient.getCategoriesByIds(
      relatedIds
    )) as WpBuildingCategory[]

    // Fetch media for related buildings
    const firstMediaIds = relatedBuildings
      .map((b) => b.acf?.slideshow?.[0])
      .filter(Boolean) as number[]

    if (firstMediaIds.length > 0) {
      const mediaItems = (await wpClient.getMediaByIds(
        firstMediaIds
      )) as WpMediaItem[]
      const mediaMap = new Map(mediaItems.map((m) => [m.id, m]))

      return relatedBuildings.map((b) => ({
        ...b,
        _media: b.acf?.slideshow?.[0] ? mediaMap.get(b.acf.slideshow[0]) : null
      }))
    }

    return relatedBuildings
  } catch (error) {
    logError('Failed to fetch related buildings:', error)
    return []
  }
}

/**
 * Fetch reviews (blog posts) for a building category
 */
export async function fetchBuildingReviews(buildingSlug: string) {
  try {
    const client = CmsService.getBlogClient()
    const [posts, totalPosts] = await Promise.all([
      client.getPosts({
        category: buildingSlug,
        limit: blogConfig.postsPerPage,
        offset: 0
      }),
      client.getTotalPosts({ category: buildingSlug })
    ])
    return { posts, totalPosts }
  } catch (error) {
    logError('Failed to fetch building reviews:', error)
    return { posts: [], totalPosts: 0 }
  }
}

export function buildBuildingDescription(
  name: string,
  cmsDescription: string | undefined | null,
  descriptionTemplate: string
): string {
  if (cmsDescription) {
    return `${cmsDescription.slice(0, 155).replace(/<[^>]+>/g, '')}…`
  }
  return descriptionTemplate.replace('{name}', name)
}

export async function fetchBuildingOgImage(building: {
  name: string
  acf?: { slideshow?: number[] }
}): Promise<{ url: string; alt: string; width?: number; height?: number }[]> {
  const firstId = (building.acf?.slideshow as number[] | undefined)?.[0]
  if (!firstId) return []
  try {
    const wpClient = CmsService.getBlogClient() as WordPressClient
    const items = (await wpClient.getMediaByIds([firstId])) as WpMediaItem[]
    const item = items[0]
    if (!item) return []
    return [
      {
        url: item.source_url,
        alt: item.alt_text ?? building.name,
        width: item.media_details?.width,
        height: item.media_details?.height
      }
    ]
  } catch {
    return []
  }
}
