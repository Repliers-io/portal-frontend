import {
  fetchBuilding,
  fetchBuildingReviews,
  fetchRelatedBuildings
} from 'app/building/[...path]/_utils'

import {
  type ApiBuilding,
  APIBuildings,
  type ApiBuildingsQueryParams,
  transient
} from 'services/API'
import { logError } from 'utils/log'

export interface ParsedAddressSlug {
  streetNumber?: string
  streetName?: string
  buildingId?: string
}

/**
 * Parse a condo detail URL's slug array into structured location + building identifier.
 *
 * URL structure built by getBuildingUrl + getLocationBuildingsUrl:
 *   {area-area?} / {city?} / {hood?} / {addressSlug} / {buildingName?}
 *
 * The addressSlug starts with a street number; buildingName is optional and follows it.
 * A name-only URL (from the building redirects) has no addressSlug — its single trailing
 * segment is the building name, which may itself contain digits (e.g. "olive-8", "one88").
 */
export interface ParsedCondoUrl {
  area: string
  city: string
  neighborhood: string
  address?: string
  slug?: string
}

const decodeSeg = (s: string) => decodeURIComponent(s).replace(/-/g, ' ').trim()

export function parseCondoUrl(slugs: string[]): ParsedCondoUrl {
  const remaining = [...slugs]

  let area = ''
  if (remaining[0]?.endsWith('-area')) {
    area = decodeSeg(remaining.shift()!.replace(/-area$/, ''))
  }

  const city = remaining[0] ? decodeSeg(remaining[0]) : ''
  const neighborhood = remaining[1] ? decodeSeg(remaining[1]) : ''
  const third = remaining[2]
  const fourth = remaining[3]

  // A trailing 4th segment is the building name, so the 3rd is the address (5-segment URL).
  // In a 4-segment URL the 3rd is an address only when it starts with a street number;
  // otherwise it is a building name — which may itself contain digits ("olive-8", "one88"),
  // so a bare /\d/ test would misread those as addresses and fail to resolve the building.
  if (fourth) {
    return { area, city, neighborhood, address: third, slug: fourth }
  }
  if (third && /^\d/.test(third)) {
    return { area, city, neighborhood, address: third }
  }
  return { area, city, neighborhood, slug: third }
}

/**
 * Parse building slug back to street address components
 * Format: "107-boston-road-123" -> { streetNumber: "107", streetName: "boston road", buildingId: "123" }
 */
export function parseAddressSlug(slug: string): ParsedAddressSlug {
  if (!slug) return {}

  // Last segment after last dash is the building ID
  const parts = slug.split('-')
  const buildingId = parts[parts.length - 1]

  // Check if last part is a number (building ID)
  const hasId = /^\d+$/.test(buildingId)
  const addressParts = hasId ? parts.slice(0, -1) : parts

  // First part that's a number is street number
  const streetNumberIndex = addressParts.findIndex((part) => /^\d+/.test(part))

  if (streetNumberIndex === -1) {
    return {
      streetName: addressParts.join(' '),
      buildingId: hasId ? buildingId : undefined
    }
  }

  return {
    streetNumber: addressParts[streetNumberIndex],
    streetName: addressParts.slice(streetNumberIndex + 1).join(' '),
    buildingId: hasId ? buildingId : undefined
  }
}

/**
 * Fetch a single building by location and street address or building name
 */
export async function fetchLocationBuilding({
  city,
  neighborhood,
  streetNumber,
  streetName,
  buildingId,
  buildingName
}: {
  city?: string
  neighborhood?: string
  streetNumber?: string
  streetName?: string
  buildingId?: string
  buildingName?: string
}): Promise<ApiBuilding | null> {
  const params: ApiBuildingsQueryParams = {
    resultsPerPage: 1,
    class: 'condo'
  }

  if (city) params.city = city
  if (neighborhood) params.neighborhood = neighborhood

  if (buildingName) {
    params.buildingName = buildingName
  } else {
    if (streetNumber) params.streetNumber = streetNumber
    if (streetName) params.streetName = streetName
  }

  try {
    const response = await APIBuildings.fetchBuildings(params, {
      next: { revalidate: 86400 }
    } as RequestInit)

    if (!response.buildings?.length) return null

    // If buildingId provided, find exact match
    if (buildingId) {
      const building = response.buildings.find(
        (b) => b.id === Number(buildingId)
      )
      return building || null
    }

    // Otherwise return first result
    return response.buildings[0]
  } catch (error) {
    logError('[fetchLocationBuilding] error', params, error)
    if (transient(error)) throw error
    return null
  }
}

export async function fetchMatchedCmsBuilding(cmsSlug: string | null) {
  if (!cmsSlug) return null

  try {
    const cmsBuilding = await fetchBuilding(cmsSlug)
    if (!cmsBuilding) return null

    const [relatedBuildings, reviews] = await Promise.all([
      fetchRelatedBuildings(cmsBuilding),
      fetchBuildingReviews(cmsSlug)
    ])

    return { cmsBuilding, relatedBuildings, reviews }
  } catch (error) {
    logError('[fetchMatchedCmsBuilding] error', cmsSlug, error)
    return null
  }
}
