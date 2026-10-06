import type { Position } from 'geojson'
import queryString from 'query-string'

import filtersConfig, { type ListingType } from '@configs/filters'
import locationConfig from '@configs/location'
import mapConfig from '@configs/map'

import { type ApiImageSearchItem, type ApiSavedSearch } from 'services/API'
import { type Filters, getListingType } from 'services/Search'
import {
  defaultMaxPrice,
  defaultMinPrice,
  getAreaName,
  getListingStatus,
  pickFilters
} from 'providers/SaveSearchProvider'
import { pickRawFilters, rawFieldsFor, toFilterArray } from 'utils/filters'
import { formatShortPrice, toSafeNumber } from 'utils/formatters'
import {
  calcZoomLevelForBounds,
  getPositionBounds,
  getReverseGeocodingUrl
} from 'utils/map'
import { resolvableExternalIds } from 'utils/map/externalLocations'

import { type SearchParams } from './_types'

const { defaultFilters, defaultAdvancedFilters } = filtersConfig

export const getPositionFromPolygon = (polygon: Position[]) => {
  const bounds = getPositionBounds(polygon)
  const zoom = calcZoomLevelForBounds(bounds, 640, 480)
  const center = bounds.getCenter()
  const { lng, lat } = center

  // convert mapbox's LngLat based classes to plain serializable objects
  // to be able to pass them from server-side component to client-side component
  return {
    zoom,
    center: { lng, lat }
  }
}

export const getFiltersFromSavedSearch = (data: ApiSavedSearch): Filters => {
  const {
    type,
    propertyTypes,
    soldNotifications,
    keywords,
    minPrice, // special treatment for price range values stored in the saved search
    maxPrice, // special treatment for price range values stored in the saved search
    styles, // `styles` in SavedSearch API, but `style` in filters
    minBeds, // `minBeds` in SavedSearch API, but `minBedrooms` in filters
    ...restFilters
  } = pickFilters(data)

  const listingType = getListingType(propertyTypes)
  const listingStatus = soldNotifications ? 'all' : getListingStatus(type)

  return {
    ...defaultFilters,
    ...restFilters,
    // movesmartly reads the transaction axis from filters.type; harmless for
    // listingStatus-based tenants — their 'rent' transformer emits the same type
    ...(type === 'lease' && { type: 'lease' as const }),
    style: styles,
    minBedrooms: minBeds,
    search: keywords?.join(' ') || undefined,
    minPrice: minPrice > defaultMinPrice ? minPrice : 0,
    maxPrice: maxPrice >= defaultMaxPrice ? 0 : maxPrice,
    listingType,
    listingStatus
  }
}

export const getFiltersFromParams = (searchParams: SearchParams): Filters => {
  const filters = Object.fromEntries(
    Object.keys(defaultFilters).map((key) => [
      key,
      searchParams[key as keyof SearchParams] ||
        defaultFilters[key as keyof Filters]
    ])
  )

  Object.keys(defaultAdvancedFilters).forEach((key) => {
    const paramsValue = searchParams[key as keyof SearchParams]
    const defaultsValue = defaultAdvancedFilters[key as keyof Filters]
    if (!paramsValue || paramsValue === defaultsValue) return

    const booleanParam =
      typeof defaultsValue === 'boolean' &&
      (paramsValue === 'true' || paramsValue === 'false')

    const numericParam = typeof defaultsValue === 'number'

    const parsed = booleanParam
      ? paramsValue === 'true'
      : numericParam
        ? toSafeNumber(paramsValue as string)
        : paramsValue
    filters[key as keyof Filters] = parsed as Filters[keyof Filters]
  })

  // `externalLocationId` is untrusted URL input. Keep only ids a configured
  // `external` overlay can resolve — an id for an overlay this tenant lacks (e.g.
  // a shared `schools-…` link on a non-schools tenant) would otherwise sit in the
  // filter forever and block every listing fetch (unresolvedExternalIds waits on
  // it, freezing the map). Drop it here so the search runs unconstrained.
  const externalIds = resolvableExternalIds(
    toFilterArray(filters.externalLocationId as string | string[] | undefined),
    mapConfig.overlays.layers
  )
  filters.externalLocationId = externalIds.length ? externalIds : ''

  // `raw.<Field>` params turn into API parameter names: only the fields offered for
  // the parsed transaction type pass
  Object.assign(
    filters,
    pickRawFilters(
      searchParams as unknown as Record<string, string | string[] | undefined>,
      rawFieldsFor(filters as Filters)
    )
  )

  const aiFeature: ApiImageSearchItem[] = [searchParams.aiFeature]
    .flat()
    .filter(Boolean)
    .map((value) => ({ value, type: 'text', boost: 1 }))

  const aiImage: ApiImageSearchItem[] = [searchParams.aiImage]
    .flat()
    .filter(Boolean)
    .map((url) => ({ url, type: 'image', boost: 1 }))

  const imageSearchItems = [...aiFeature, ...aiImage]
  if (!imageSearchItems.length) return filters

  return { ...filters, imageSearchItems }
}

/**
 * Mirrors `getCoords`/`getZoom` (utils/map) for the plain searchParams object
 * available in generateMetadata: coordinates arrive as a bare `lat,lng` key.
 */
export const getCameraFromParams = (searchParams: SearchParams) => {
  const params = searchParams as unknown as Record<
    string,
    string | string[] | undefined
  >
  const coordsKey = Object.keys(params).find((key) =>
    /^-?[\d.]+,-?[\d.]+$/.test(key)
  )
  const [lat, lng] = coordsKey?.split(',').map(toSafeNumber) ?? []
  if (!lat || !lng) return null

  return {
    lat,
    lng,
    zoom: toSafeNumber(params.z as string) || mapConfig.mapboxDefaults.zoom!
  }
}

// Reverse geocoding makes sense from city/neighborhood scale; below it the
// center point would name a whole region and waste a geocoding request
const geocodeMinZoom = 11

/**
 * Resolves the shared map center into an area name for page metadata —
 * the same mechanism saved-search names use (`getAreaName` zoom hierarchy).
 * Zoomed-out views (and geocoding failures) reuse the static tenant
 * state/province name, same as the saved-search fallback.
 */
export const fetchAreaName = async (camera: {
  lat: number
  lng: number
  zoom: number
}): Promise<string | undefined> => {
  if (camera.zoom < geocodeMinZoom) return locationConfig.state || undefined

  try {
    const response = await fetch(
      // ~110m precision is plenty for an area name and dedupes cache entries
      getReverseGeocodingUrl({
        lng: Number(camera.lng.toFixed(3)),
        lat: Number(camera.lat.toFixed(3))
      }),
      { next: { revalidate: 86400 } }
    )
    const data = await response.json()
    return getAreaName(data.features, camera.zoom) || locationConfig.state
  } catch {
    return locationConfig.state || undefined
  }
}

export const getOgMapImage = (
  camera: { lat: number; lng: number; zoom: number } | null,
  searchParams: Record<string, string | string[] | undefined>,
  host: string
): string | undefined => {
  if (!camera) return undefined
  const params = queryString.stringify(
    {
      lat: camera.lat,
      lng: camera.lng,
      z: camera.zoom,
      ms: searchParams.ms,
      '3d': searchParams['3d']
    },
    { skipNull: true, skipEmptyString: true }
  )
  return `${host}/api/og/map?${params}`
}

// English nouns follow the locations-meta precedent (getCatalogTitle):
// metadata strings are built in app utils, not via i18n
const listingTypeNouns: Record<ListingType, string> = {
  allListings: 'Homes',
  residential: 'Homes',
  condo: 'Condos',
  townhome: 'Townhomes',
  residentialTownhome: 'Townhouses',
  condoTownhome: 'Condo Townhouses',
  coop: 'Co-ops',
  semiDetached: 'Semi-Detached Homes',
  multiFamily: 'Multi-Family Properties',
  land: 'Land',
  business: 'Business Properties',
  commercial: 'Commercial Real Estate',
  penthouse: 'Penthouses',
  loft: 'Lofts',
  other: 'Real Estate'
}

/**
 * Human-readable sentence from search filters for page metadata,
 * e.g. "Condos for Sale in Oakville, 2+ Beds, 2+ Baths, $500K–$800K".
 * TODO: append listings count / price aggregates once a cheap server-side
 * source is available (see /api/og/map stub).
 */
export const humanizeFilters = (filters: Filters, area?: string): string => {
  const type = [filters.listingType].flat()[0] as ListingType
  const noun = listingTypeNouns[type] || listingTypeNouns.allListings
  const status = [filters.listingStatus].flat()[0]
  const place = area ? ` in ${area}` : ''

  const subject =
    (status === 'rent'
      ? `${noun} for Rent`
      : status === 'sold'
        ? `Sold ${noun}`
        : status === 'all'
          ? noun
          : `${noun} for Sale`) + place

  const counts = [
    toSafeNumber(filters.minBedrooms) > 0 && `${filters.minBedrooms}+ Beds`,
    toSafeNumber(filters.minBaths) > 0 && `${filters.minBaths}+ Baths`
  ].filter(Boolean)

  const minPrice = toSafeNumber(filters.minPrice)
  const maxPrice = toSafeNumber(filters.maxPrice)
  const price =
    minPrice && maxPrice
      ? `${formatShortPrice(minPrice)}–${formatShortPrice(maxPrice)}`
      : minPrice
        ? `above ${formatShortPrice(minPrice)}`
        : maxPrice
          ? `under ${formatShortPrice(maxPrice)}`
          : ''

  return [subject, ...counts, price].filter(Boolean).join(', ')
}
