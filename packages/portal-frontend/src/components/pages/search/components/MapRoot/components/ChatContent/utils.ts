import {
  type ApiGeoFilters,
  type ApiImageSearchItem,
  locationTypes
} from 'services/API'
import { type Filters, type MapPoint } from 'services/Search'

import { type ChatItem } from './types'

export const hasFilters = (obj: ChatItem) =>
  (obj.params && Object.keys(obj.params).length > 0) ||
  (obj.body && Object.keys(obj.body).length > 0)

/**
 * Extracts geo-location fields from filters
 */
export const extractGeoFilters = (filters: Partial<Filters>): ApiGeoFilters => {
  const result: ApiGeoFilters = {}

  for (const key of locationTypes) {
    if (filters[key]) {
      result[key] = filters[key]
    }
  }

  result.locationId = filters.locationId || undefined

  return result
}

export const extractPointParams = (params: Record<string, unknown>) => {
  const { lat, long, radius, ...filtersWithoutPoint } = params

  let point: MapPoint | null = null
  if (lat && long && radius) {
    point = { center: [Number(lat), Number(long)], radius: Number(radius) }
  }

  return { point, filters: filtersWithoutPoint as Partial<Filters> }
}

/**
 * Checks if filters contain geo-location fields
 */
export const hasGeoFilters = (filters: Partial<Filters>): boolean => {
  return locationTypes.some((key) => !!filters[key])
}

/**
 * Extracts images and features from imageSearchItems array
 */
export const extractImageSearchItems = (
  imageSearchItems: ApiImageSearchItem[] | undefined
) => {
  if (!imageSearchItems?.length) {
    return { images: [], features: [] }
  }

  const images = imageSearchItems
    .filter((item) => item.type === 'image')
    .map((item) => item.url!)

  const features = imageSearchItems
    .filter((item) => item.type === 'text')
    .map((item) => item.value!)

  return { images, features }
}
