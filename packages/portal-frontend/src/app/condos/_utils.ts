import searchConfig from '@configs/search'

import { type BuildingWithMedia } from 'app/buildings/_utils'

import {
  type ApiBuilding,
  APIBuildings,
  type ApiBuildingsQueryParams,
  type ApiBuildingsResponse,
  transient
} from 'services/API'
import { findCmsSlugByApiBuilding } from 'utils/buildings/buildingMatcher'
import { logError } from 'utils/log'

const { pageSize } = searchConfig

export type EnrichedBuilding = ApiBuilding & {
  source: 'mixed' | 'repliers'
  cmsImageUrl?: string
}

export function enrichBuildingsWithCmsData(
  buildings: ApiBuilding[],
  cmsBuildings: BuildingWithMedia[]
): EnrichedBuilding[] {
  const slugToImageUrl = new Map<string, string>()
  for (const { building, media } of cmsBuildings) {
    const imageUrl =
      media?.media_details?.sizes?.['medium']?.source_url ||
      media?.media_details?.sizes?.['medium_large']?.source_url ||
      media?.source_url
    if (imageUrl) slugToImageUrl.set(building.slug, imageUrl)
  }

  return buildings.map((b) => {
    const city = b.address?.city
    const hood = b.address?.neighborhood
    const cmsSlug = city ? findCmsSlugByApiBuilding(b, city, hood ?? '') : null
    if (cmsSlug) {
      return {
        ...b,
        source: 'mixed' as const,
        cmsImageUrl: slugToImageUrl.get(cmsSlug)
      }
    }
    return { ...b, source: 'repliers' as const }
  })
}

export interface LocationBuildingsParams {
  area?: string
  city?: string
  hood?: string
  page?: number
}

/**
 * Fetch buildings from the API filtered by location path
 *
 * The API supports `city` and `neighborhood` params directly.
 * For area-level queries we fetch all buildings for the area's cities
 * (the API doesn't have an `area` param, but we can pass city names
 * resolved from the tree). For now, if only area is provided
 * and no city, we fetch without geo-filter — the tree navigation
 * will guide users to drill down.
 */
export async function fetchLocationBuildings({
  city,
  hood,
  page = 1
}: LocationBuildingsParams): Promise<ApiBuildingsResponse> {
  const params: ApiBuildingsQueryParams = {
    resultsPerPage: pageSize,
    pageNum: page,
    class: 'condo',
    minStories: 4
  }

  if (hood) params.neighborhood = hood
  if (city) params.city = city

  try {
    const result = await APIBuildings.fetchBuildings(params, {
      next: { revalidate: 86400 }
    } as RequestInit)
    return {
      ...result,
      buildings: result.buildings ?? [],
      numPages: result.numPages ?? 0
    }
  } catch (error) {
    logError('[fetchLocationBuildings] error', params, error)
    if (transient(error)) throw error
    return {
      page: 1,
      numPages: 0,
      pageSize,
      count: 0,
      buildings: []
    }
  }
}

/**
 * Number of top cities (by listing count) for which we fetch building counts.
 * Used for the state-level SEO description block.
 */
export const topCitiesForBuildings = 50

/**
 * Fetch building counts for a list of cities in parallel.
 * Uses the same filters as fetchLocationBuildings (condo, minStories: 4).
 * Returns a map of city name → building count.
 */
export async function fetchCityBuildingCounts(
  cityNames: string[]
): Promise<Record<string, number>> {
  const results = await Promise.all(
    cityNames.map(async (city) => {
      try {
        const { count } = await APIBuildings.fetchBuildings(
          { city, class: 'condo', minStories: 4, resultsPerPage: 1 },
          { next: { revalidate: 86400 } } as RequestInit
        )
        return [city, count] as const
      } catch (error) {
        logError('[fetchCityBuildingCounts]', city, error)
        if (transient(error)) throw error
        return [city, 0] as const
      }
    })
  )
  return Object.fromEntries(results)
}

/**
 * Fetch building counts for a list of neighborhoods within a city in parallel.
 * Uses the same filters as fetchLocationBuildings (condo, minStories: 4).
 * Returns a map of neighborhood name → building count.
 */
export async function fetchHoodBuildingCounts(
  city: string,
  hoodNames: string[]
): Promise<Record<string, number>> {
  const results = await Promise.all(
    hoodNames.map(async (hood) => {
      try {
        const { count } = await APIBuildings.fetchBuildings(
          {
            city,
            neighborhood: hood,
            class: 'condo',
            minStories: 4,
            resultsPerPage: 1
          },
          { next: { revalidate: 86400 } } as RequestInit
        )
        return [hood, count] as const
      } catch (error) {
        logError('[fetchHoodBuildingCounts]', hood, error)
        if (transient(error)) throw error
        return [hood, 0] as const
      }
    })
  )
  return Object.fromEntries(results)
}

/**
 * Fetch all buildings for a single city, paginating until exhausted.
 * Uses the same class/minStories filter as the buildings page.
 */
export async function fetchAllBuildingsForCity(
  city: string
): Promise<ApiBuilding[]> {
  const pageSize = 100
  const firstPage = await APIBuildings.fetchBuildings(
    {
      city,
      class: 'condo',
      minStories: 4,
      resultsPerPage: pageSize,
      pageNum: 1
    },
    { next: { revalidate: 86400 } } as RequestInit
  )

  const allBuildings = [...firstPage.buildings]
  const remaining = Array.from(
    { length: firstPage.numPages - 1 },
    (_, i) => i + 2
  )

  const extraPages = await Promise.all(
    remaining.map((pageNum) =>
      APIBuildings.fetchBuildings(
        {
          city,
          class: 'condo',
          minStories: 4,
          resultsPerPage: pageSize,
          pageNum
        },
        { next: { revalidate: 86400 } } as RequestInit
      ).catch((error) => {
        logError(
          `[fetchAllBuildingsForCity] ${city} page ${pageNum} failed:`,
          error
        )
        if (transient(error)) throw error
        return { buildings: [] as ApiBuilding[] }
      })
    )
  )

  for (const page of extraPages) {
    allBuildings.push(...page.buildings)
  }

  return allBuildings
}
