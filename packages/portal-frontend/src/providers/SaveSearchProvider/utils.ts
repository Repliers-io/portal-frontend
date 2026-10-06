import type { Feature, Polygon, Position } from 'geojson'

import filtersConfig, {
  type ListingStatus,
  type ListingType
} from '@configs/filters'
import { featureCollection, polygon, union } from '@turf/turf'

import {
  type ApiClass,
  type ApiLocation,
  APILocations,
  type ApiQueryParams,
  type ApiSavedSearch,
  type ApiSavedSearchCreateRequest
} from 'services/API'
import {
  flattenFilterArrays,
  mergeFilters,
  transformFilters
} from 'services/Search'
import { boundsToRing } from 'utils/map'

import {
  defaultMaxPrice,
  defaultMinPrice,
  keysToPick,
  places
} from './constants'
import type { CreateSearchParams } from './types'

const removeSubParts = (parts: string[]): string[] => {
  return parts.filter((part, index) => {
    return !parts.some(
      (otherPart, otherIndex) =>
        otherIndex !== index && otherPart.includes(part)
    )
  })
}

const sanitizeNameParts = (location: string) => {
  return removeSubParts([
    ...new Set(location.split(',').map((part: string) => part.trim()))
  ] as string[])
}

export const getAreaName = (
  features: any,
  zoom: number
): string | undefined => {
  const applicableHierarchy =
    places.find((level) => zoom > level.minZoom) || places[places.length - 1]

  for (const placeType of applicableHierarchy.types) {
    const matchingFeature = features.find(
      (feature: any) => feature.place_type[0] === placeType
    )
    if (matchingFeature) {
      // filter out duplicates and subparts
      const nameParts = sanitizeNameParts(matchingFeature.place_name)

      if (zoom >= 16.5) {
        // `text` field contains the same street name as nameParts[0], but without the house number
        return matchingFeature.text + ', ' + nameParts.slice(1, 2).join(', ')
      } else if (zoom > 12 && nameParts.length > 3) {
        // last two parts are usuallly state and country, no need to add them
        return nameParts.slice(0, 2).join(', ')
      }
      return nameParts[0]
    }
  }
}

export const removeFalsyItems = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v))

export const removeNullishItems = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  )

const pickKeys = <T extends Record<string, any>, K extends keyof T>(
  source: T,
  keys: K[]
): Partial<T> => {
  const result: Partial<T> = {}
  keys.forEach((key) => {
    if (key in source) {
      result[key] = source[key]
    }
  })
  return result
}

export const pickFilters = (data: ApiSavedSearch) => {
  return removeFalsyItems(pickKeys(data, keysToPick))
}

export const getSearchClasses = (
  listingType: ListingType | ListingType[] | undefined
): ApiClass[] => {
  const types = [listingType].flat().filter(Boolean) as ListingType[]
  if (!types.length || types.includes('allListings')) {
    return ['condo', 'residential']
  }
  const classes = new Set<ApiClass>()
  types.forEach((t) => {
    if (t === 'condo') classes.add('condo')
    else if (['commercial', 'business', 'land'].includes(t))
      classes.add('commercial')
    else classes.add('residential')
  })
  return [...classes]
}

export const getListingStatus = (searchType: string): ListingStatus =>
  searchType === 'lease' ? 'rent' : 'active'

/**
 * Boundary geometry (Polygon rings or a MultiPolygon) of each selected location.
 * External locations carry geometry client-side; natives selected interactively
 * don't — fetched by id. Locations without any polygon are skipped: a saved
 * search persists geometry only, so its result set may be NARROWER than what was
 * on screen (polygon-less locations match live by `locationId`).
 */
export const resolveLocationBoundaries = async (
  locations: ApiLocation[]
): Promise<(Position[][] | Position[][][])[]> => {
  const boundaries = await Promise.all(
    locations.map(async (location) => {
      if (location.map?.boundary?.length) return location.map.boundary
      if (location.external) return null
      const response = await APILocations.fetch({
        locationId: location.locationId,
        fields: 'locationId,name,type,map'
      })
      return response?.locations?.[0]?.map?.boundary ?? null
    })
  )
  return boundaries.filter((b): b is NonNullable<typeof b> =>
    Boolean(b?.length)
  )
}

/**
 * Dissolve every search-area polygon — drawn or location-derived — into a single
 * saved-search `map` Polygon with `union`: overlapping areas merge into one
 * outline (with holes only where they genuinely exist). The endpoint accepts a
 * single Polygon only, so a disjoint union (which turf returns as a MultiPolygon)
 * is flattened to its outer rings. Returns null when there are no areas.
 */
export const unionAreas = (
  areas: (Position[][] | Position[][][])[]
): Position[][] | null => {
  // Decompose every area into individual single-polygon features so `union`
  // dissolves across ALL of them, no matter how they were grouped (one
  // MultiPolygon area, several Polygons, or a mix).
  const features: Feature<Polygon>[] = areas.flatMap((area) =>
    Array.isArray(area[0]?.[0]?.[0])
      ? (area as Position[][][]).map((poly) => polygon(poly))
      : [polygon(area as Position[][])]
  )

  if (!features.length) return null

  const merged =
    features.length === 1 ? features[0] : union(featureCollection(features))
  if (!merged) return null

  // The saved-search `map` accepts a single Polygon only (a MultiPolygon is
  // rejected). Overlapping areas dissolve into one; a disjoint union comes back
  // as a MultiPolygon, flattened here to its outer rings — the server reads the
  // extra rings as holes, which for separate areas fall outside and are ignored.
  return merged.geometry.type === 'Polygon'
    ? merged.geometry.coordinates
    : merged.geometry.coordinates.map((poly) => poly[0])
}

export const prepareParams = (params: CreateSearchParams, clientId: number) => {
  const { filters, region, bounds, name, notificationFrequency } = params

  const {
    type: transactionType,
    listingType,
    listingStatus,
    minBedrooms: minBeds,
    minBaths,
    minGarageSpaces,
    minParkingSpaces,
    minYearBuilt,
    maxYearBuilt,
    maxMaintenanceFee,
    minSqft,
    maxSqft,
    minLotSizeSqft,
    maxLotSizeSqft,
    minLotWidth,
    maxLotWidth,
    style,
    basement,
    search
  } = filters || {}

  let { minPrice, maxPrice } = filters || {}
  minPrice ||= defaultMinPrice
  maxPrice ||= defaultMaxPrice

  // SaveSearch specific parameters which differ from Search filters

  // The caller already unioned the selection (or fell back to a loaded search's
  // region) into `region`; otherwise fall back to the viewport bounds.
  const map = region?.length ? region : boundsToRing(bounds!)

  const statuses = [listingStatus].flat().filter(Boolean) as ListingStatus[]
  // the transaction axis lives in filters.type (movesmartly) or in
  // listingStatus 'rent' (other tenants) — honour both
  const type =
    transactionType === 'lease' || statuses.includes('rent') ? 'lease' : 'sale'
  const soldNotifications = statuses.some((s) => ['all', 'sold'].includes(s))
  // group 7 `listingType`s into 3 `classes`
  const searchClasses = getSearchClasses(listingType)

  // transform `listingType` into `propertyTypes` suitable for API
  // When listingType is absent (rent mode — key removed from filters), fall back to TYPE_RENTAL.
  let propertyTypes: string[] = []
  if (listingType !== undefined) {
    const transformed = transformFilters(['listingType'], {
      listingType
    } as Partial<ApiQueryParams>)
    const merged = mergeFilters(transformed)
    const processedFilters = flattenFilterArrays(merged)
    propertyTypes = processedFilters.propertyType ?? []
  } else if (type === 'lease') {
    propertyTypes =
      (filtersConfig.listingStatusDeclaration.rent?.propertyType as string[]) ??
      []
  }

  return removeFalsyItems({
    map,
    name,
    type,
    class: searchClasses,
    clientId,
    minBeds, // minBedrooms in filters, but SavedSearch API expects minBeds
    minBaths,
    minPrice,
    maxPrice,
    propertyTypes,
    minGarageSpaces,
    minParkingSpaces,
    soldNotifications,
    notificationFrequency,
    minYearBuilt,
    maxYearBuilt,
    maxMaintenanceFee,
    minSqft,
    maxSqft,
    minLotSizeSqft,
    maxLotSizeSqft,
    minLotWidth,
    maxLotWidth,
    styles: style, // `style` in filters, but SavedSearch API expects `styles`
    basement,
    keywords: search ? [search] : undefined
  }) as ApiSavedSearchCreateRequest
}
