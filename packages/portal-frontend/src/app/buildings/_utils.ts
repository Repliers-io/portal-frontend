import CmsService, { type WordPressClient } from 'services/CMS'
import { type WpMediaItem } from 'services/CMS/clients/WordPressClient/types'
import { logError } from 'utils/log'

export type BuildingWithMedia = {
  building: {
    id: number
    name: string
    slug: string
    link?: string
    acf?: {
      slideshow?: number[]
      map?: { address?: string }
      template?: string | false
    }
  }
  media: WpMediaItem | null
}

/**
 * Fetch all WP categories where acf.template === 'building' and attach first media.
 * This is the canonical source — no group CPT indirection.
 */
export async function fetchAllCmsBuildingsWithMedia(): Promise<
  BuildingWithMedia[]
> {
  const wpClient = CmsService.getBlogClient() as WordPressClient

  let allCategories: unknown[] = []
  try {
    allCategories = await wpClient.getAllCategories()
  } catch (error) {
    logError('Failed to fetch CMS buildings:', error)
    return []
  }

  const buildings = (
    allCategories as Array<BuildingWithMedia['building']>
  ).filter((cat) => cat.acf?.template === 'building')

  // Extract first slideshow media ID per building
  const firstMediaIds = buildings
    .map((b) => (b.acf?.slideshow as number[] | undefined)?.[0])
    .filter(Boolean) as number[]

  const mediaMap = new Map<number, WpMediaItem>()
  if (firstMediaIds.length > 0) {
    try {
      const mediaItems = (await wpClient.getMediaByIds(
        firstMediaIds
      )) as WpMediaItem[]
      mediaItems.forEach((m) => mediaMap.set(m.id, m))
    } catch (error) {
      logError('Failed to fetch media:', error)
    }
  }

  return buildings.map((b) => {
    const firstMediaId = (b.acf?.slideshow as number[] | undefined)?.[0]
    return {
      building: b,
      media: firstMediaId ? (mediaMap.get(firstMediaId) ?? null) : null
    }
  })
}

export const buildingsPerPage = 96

export async function fetchAllBuildings(page = 1) {
  const allBuildings = await fetchAllCmsBuildingsWithMedia()
  const total = allBuildings.length
  const start = (page - 1) * buildingsPerPage
  const buildings = allBuildings.slice(start, start + buildingsPerPage)

  return { buildings, total, page, perPage: buildingsPerPage }
}

/**
 * Fetch buildings for a specific group slug.
 * Still uses the old CPT→ACF approach for the browse sub-route — kept as-is.
 */
export async function fetchCategoryWithBuildings(categorySlug: string) {
  const wpClient = CmsService.getBlogClient() as WordPressClient

  // CPT "buildings" = group containers; try to find the group
  type WpGroup = { id: number; slug: string; acf?: { categories?: number[] } }
  let groups: WpGroup[] = []
  try {
    groups = (await wpClient.getCustomPosts('buildings', {
      limit: 100
    })) as unknown as WpGroup[]
  } catch {
    return null
  }

  const group = groups.find((g) => g.slug === categorySlug)
  if (!group) return null

  const buildingIds: number[] = (group.acf?.categories as number[]) || []
  if (buildingIds.length === 0) return { type: group, buildings: [] }

  const allBuildings = await fetchAllCmsBuildingsWithMedia()
  const buildings = allBuildings.filter(({ building }) =>
    buildingIds.includes(building.id)
  )

  return { type: group, buildings }
}

export function buildBuildingsBrowseDescription(
  type: string,
  descriptionTemplate: string
): string {
  return descriptionTemplate.replace('{type}', type)
}
