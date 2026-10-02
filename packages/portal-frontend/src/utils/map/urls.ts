import { type Position } from 'geojson'
import mapboxgl, { type LngLat, type LngLatLike } from 'mapbox-gl'
import queryString from 'query-string'

import apiConfig from '@configs/api'
import { markerColors } from '@configs/colors'
import filtersConfig from '@configs/filters'
import mapConfig from '@configs/map'
import paramsConfig from '@configs/params'
import routes from '@configs/routes'
import { type MapStyle } from '@defaults/map'

import { type ApiCoords, type ApiLocation } from 'services/API'
import {
  type Filters,
  getNonDefaultFilters,
  type MapPoint
} from 'services/Search'
import { deduplicateGeoFilters } from 'utils/filters'
import { toSafeNumber } from 'utils/formatters'

import { toGoogleZoom } from './converters'
import { serializePoint } from './point'

export const getZoom = (searchParams: URLSearchParams) =>
  toSafeNumber(searchParams.get(paramsConfig.zoom)) ||
  mapConfig.mapboxDefaults.zoom!

export type MapOrientation = { bearing: number; pitch: number }

// Default camera orientation when 3D mode turns on without explicit values
export const defaultOrientation = (): MapOrientation => ({
  bearing: 0,
  pitch: mapConfig.map3D.pitch.default
})

/**
 * Parses the 3D-mode URL param: `<bearing>[,<pitch>]`.
 * A bare param (`?3d`) activates 3D with the default orientation;
 * pitch is clamped to the configured range. Returns null when absent.
 */
export const getOrientation = (
  searchParams: URLSearchParams
): MapOrientation | null => {
  const raw = searchParams.get(paramsConfig.mode3D)
  if (raw === null) return null

  const [bearing, pitch] = raw.split(',').map(toSafeNumber)
  return {
    bearing,
    pitch:
      pitch === undefined
        ? defaultOrientation().pitch
        : Math.min(mapConfig.map3D.pitch.max, Math.max(0, pitch))
  }
}

export const getCoords = (searchParams: URLSearchParams) => {
  const firstParam = searchParams.keys().next().value || ''
  const matches = firstParam.match(/([-0-9.]+),([-0-9.]+)/)
  const [, lat, lng] = matches || [0, 0, 0]

  if (!lat || !lng) return null

  return new mapboxgl.LngLat(toSafeNumber(lng), toSafeNumber(lat))
}

export const roundCoord = (coord: number | string) => Number(coord).toFixed(6)

export const formatCoords = (lngLat: LngLatLike) => {
  const { lat, lng } = mapboxgl.LngLat.convert(lngLat)
  return `${roundCoord(lat)},${roundCoord(lng)}`
}

export const formatZoom = (zoom: number) => String(zoom).slice(0, 8)

export const getMapStyleUrl = (style: MapStyle) =>
  `mapbox://styles/mapbox/${mapConfig.mapStyles[style]}`

export const getMapboxStaticStyleUrl = (style: MapStyle) =>
  `https://api.mapbox.com/styles/v1/mapbox/${mapConfig.mapStyles[style]}/static`

export const getMapboxStaticMarker = (
  longitude: string | number,
  latitude: string | number,
  symbol = 'home'
) => {
  const markerSize = 'l'
  const markerColor = markerColors.default.color.replace('#', '')
  return `pin-${markerSize}-${symbol}+${markerColor}(${longitude},${latitude})`
}

export const getGmapsStaticMarker = (
  longitude: string | number,
  latitude: string | number,
  symbol = 'home'
) => {
  // Google Maps only supports A-Z, 0-9 in labels
  // For house/home properties, use 'H' as a simple home indicator
  const label = symbol.charAt(0).toUpperCase()

  const markerColor = markerColors.default.color.replace('#', '')
  // Google Static Maps marker param is `markers=` (not `markerColors=`); it is also the map's
  // only location anchor here (no `center` param), so a wrong name yields a blank/black tile.
  const labelPart = label ? `label:${label}%7C` : ''
  return `markers=color:0x${markerColor}%7C${labelPart}${latitude},${longitude}`
}

// const getGmapsSymbol = (listing: ApiListing) => {
//   const maki = getMakiSymbol(listing)
//   return maki === 'home' ? 'H' : maki.charAt(0).toUpperCase()
// }

/** Mapbox reverse geocoding for a point — features are parsed by `getAreaName` */
export const getReverseGeocodingUrl = ({
  lng,
  lat
}: {
  lng: number
  lat: number
}) =>
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapConfig.mapboxDefaults.accessToken}`

type StaticImageUrlParams = {
  point: ApiCoords
  /** Maki symbol for the marker pin; omit to render the map without one
   * (e.g. OpenGraph area shares) */
  symbol?: string
  width?: number
  height?: number
  zoom?: number
  style?: MapStyle
  /** Camera rotation in degrees; normalized to the 0–360 range the API expects */
  bearing?: number
  /** Camera tilt in degrees; the static API caps it at 60 */
  pitch?: number
}

export const getMapboxStaticImageUrl = ({
  point,
  symbol,
  width = 560,
  height = 200,
  zoom = mapConfig.zoom.address,
  style = 'hybrid',
  bearing,
  pitch
}: StaticImageUrlParams): string => {
  const { longitude, latitude } = point
  const imageSize = `${width}x${height}@2x`

  const normalizedBearing = (((bearing ?? 0) % 360) + 360) % 360
  const camera = [
    longitude,
    latitude,
    zoom,
    // bearing is required by the API position format whenever pitch is set
    ...(normalizedBearing || pitch ? [normalizedBearing] : []),
    ...(pitch ? [pitch] : [])
  ].join(',')

  const marker = symbol
    ? `${getMapboxStaticMarker(longitude, latitude, symbol)}/`
    : ''
  const staticStyleUrl = getMapboxStaticStyleUrl(style)
  const staticImageUrl = `${staticStyleUrl}/${marker}${camera}/${imageSize}?access_token=${mapConfig.mapboxDefaults.accessToken}`

  return staticImageUrl
}

export const getGmapsStaticImageUrl = ({
  point,
  width = 560,
  height = 200,
  zoom = mapConfig.zoom.address
}: StaticImageUrlParams): string => {
  const { longitude, latitude } = point

  // WARN: google maps static API requires minimum aspect ratio of 16:10
  // if width is greater than 640px (and scale == 2)
  const minAspectRatio = 0.465625 // 16:10 aspect ratio
  if (width > 640 && height / width < minAspectRatio) {
    // eslint-disable-next-line no-param-reassign
    height = Math.round(width * minAspectRatio)
  }

  const size = `${width}x${height}`

  const symbol = '' // getGmapsSymbol(listing)

  const marker = getGmapsStaticMarker(longitude, latitude, symbol)
  const params = queryString.stringify({
    size,
    scale: 2, // equivalent to @2x in Mapbox
    zoom: toGoogleZoom(zoom),
    maptype: 'hybrid',
    format: 'jpg',
    key: apiConfig.gmapsApiKey
  })
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  const staticImageUrl = `${baseUrl}?${marker}&${params}`

  return staticImageUrl
}

/**
 * Extracts imageSearchItems from filters and converts them to arrays
 * Returns arrays of image URLs and feature text values
 */
const extractAiFilters = (filters: Filters) => {
  const { imageSearchItems } = filters

  if (!imageSearchItems || !Array.isArray(imageSearchItems))
    return { aiImage: [], aiFeature: [] }

  const aiImage = imageSearchItems
    .map((item: { url?: string }) => item.url)
    .filter(Boolean)

  const aiFeature = imageSearchItems
    .map((item: { value?: string }) => item.value!)
    .filter(Boolean)

  return { aiImage, aiFeature }
}

// movesmartly (and any tenant whose filters config carries a `type` default)
// encodes the sale/lease choice in `filters.type`, not `listingStatus` — its
// map UI uses TypeSelect and never emits a `rent` status. So a map URL built
// from catalog-style filters (popular searches) must carry rent as `type=lease`.
const typeBasedLease = 'type' in filtersConfig.defaultFilters

const applyLeaseType = (filters: Filters): Filters => {
  if (!typeBasedLease || ![filters.listingStatus].flat().includes('rent'))
    return filters
  const { listingStatus: _listingStatus, ...rest } = filters
  return { ...rest, type: 'lease' }
}

export const getMapUrl = ({
  center,
  zoom,
  layout = 'map',
  filters,
  query,
  page,
  point,
  polygon,
  location,
  layers,
  mode3D,
  style
}: {
  center?: LngLatLike
  zoom?: number
  layout?: 'map' | 'grid' | 'chat'
  filters?: Filters
  // synthetic query params used by page but not the API
  query?: string | null
  page?: number | string | null
  point?: MapPoint | null
  polygon?: Position[] | null
  location?: ApiLocation | ApiLocation[] | null
  layers?: string[]
  /** Camera orientation serialized into the 3D param; null/undefined = 3D off */
  mode3D?: MapOrientation | null
  /** Map style carried in the URL; null/undefined = page default */
  style?: MapStyle | null
}) => {
  const baseUrl =
    center && zoom
      ? `${routes[layout]}?${formatCoords(center)}&z=${formatZoom(zoom)}`
      : routes[layout]
  const nonEmptyFilters = getNonDefaultFilters(applyLeaseType(filters || {}))

  // Extract AI search items to URL params (as strings!)
  const { aiImage, aiFeature } = extractAiFilters(filters || {})

  // Remove geo-filters that are already in location path
  const urlFilters = deduplicateGeoFilters(nonEmptyFilters)

  const locationIds = location
    ? [location].flat().map((l) => l.locationId)
    : null

  const params = queryString.stringify(
    {
      ...urlFilters,
      q: query,
      page: Number(page) > 1 ? Number(page) : null,
      ...(point ? { point: serializePoint(point) } : {}),
      ...(polygon ? { polygon: `[${polygon.join(',')}]` } : {}),
      ...(locationIds ? { locationId: locationIds } : {}),
      ...(layers?.length ? { layers } : {}),
      ...(mode3D
        ? { [paramsConfig.mode3D]: `${mode3D.bearing},${mode3D.pitch}` }
        : {}),
      ...(style ? { [paramsConfig.mapStyle]: style } : {}),
      // stringified/simplified values of `imageSearchItems` to pass into URL
      // WARN: not a real filter, but mappings/split to 2 arrays
      aiImage,
      aiFeature
    },
    {
      arrayFormat: 'none',
      skipEmptyString: true,
      skipNull: true
    }
  )

  if (!params) return baseUrl

  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${params}`
}

export const getGoogleMapUrl = ({
  center,
  zoom = 15
}: {
  center: LngLat
  zoom?: number
}) => {
  const params = queryString.stringify({
    api: 1,
    query: formatCoords(center),
    zoom
  })
  return `https://www.google.com/maps/search/?${params}`
}
