import { type Feature, type Point, type Position } from 'geojson'
import mapboxgl, { type LngLat, type LngLatBounds } from 'mapbox-gl'
import { type Map as MapboxMap } from 'mapbox-gl'
import queryString from 'query-string'

import { lighten } from '@mui/material'

import apiConfig from '@configs/api'
import { info, secondary } from '@configs/colors'
import mapConfig, { type MapStyle } from '@configs/map'
import paramsConfig from '@configs/params'
import routes from '@configs/routes'

import { type ApiBounds, type ApiCoords, type Property } from 'services/API'
import { type Filters, getNonDefaultFilters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'
import { getMakiSymbol } from 'utils/properties'

type Polygon = Array<{ lat: number; lng: number }>

const { defaultAddressZoom, defaultPolygon, mapboxDefaults, mapStyles } =
  mapConfig

/**
 * @description Function to convert custom polygon object from '@configs/map' module to mapbox bounds
 */
export const getPolygonBounds = (polygon: Polygon) => {
  const { tl, br } = polygon.reduce(
    (acc: any, point: any) => {
      acc.tl.lat = Math.max(acc.tl.lat, point.lat)
      acc.tl.lng = Math.min(acc.tl.lng, point.lng)
      acc.br.lat = Math.min(acc.br.lat, point.lat)
      acc.br.lng = Math.max(acc.br.lng, point.lng)
      return acc
    },
    {
      tl: { lat: -Infinity, lng: Infinity },
      br: { lat: Infinity, lng: -Infinity }
    }
  )

  return new mapboxgl.LngLatBounds(tl, br)
}

export const getPositionBounds = (position: Position[]) => {
  return getPolygonBounds(position.map(([lng, lat]) => ({ lng, lat })))
}

export const getDefaultBounds = () => {
  return getPolygonBounds(defaultPolygon)
}

export const getZoom = (searchParams: URLSearchParams) =>
  toSafeNumber(searchParams.get(paramsConfig.zoom)) || mapboxDefaults.zoom!

export const getCoords = (searchParams: URLSearchParams) => {
  const firstParam = searchParams.keys().next().value || ''
  const matches = firstParam.match(/([-0-9.]+),([-0-9.]+)/)
  const [, lat, lng] = matches || [0, 0, 0]

  if (!lat || !lng) return null

  return new mapboxgl.LngLat(toSafeNumber(lng), toSafeNumber(lat))
}

export const roundCoord = (coord: number | string) => Number(coord).toFixed(6)

export const formatCoords = (lngLat: LngLat) => {
  const { lat, lng } = lngLat
  return `${roundCoord(lat)},${roundCoord(lng)}`
}

// Convert Mapbox zoom level to Google Maps zoom level
// Mapbox tends to show more detail at the same zoom level
export const toGoogleZoom = (mapboxZoom: number): number => {
  // Approximate conversion: Google zoom is typically 1-2 levels higher
  // This is based on empirical testing and may need fine-tuning
  const googleZoom = Math.round(mapboxZoom + 1.25)
  // Clamp to Google Maps valid range (0-21)
  return Math.max(0, Math.min(21, googleZoom))
}

export const getMapStyleUrl = (style: MapStyle) =>
  `mapbox://styles/mapbox/${mapStyles[style]}`

export const getMapboxStaticStyleUrl = (style: MapStyle) =>
  `https://api.mapbox.com/styles/v1/mapbox/${mapStyles[style]}/static`

export const getMapboxStaticMarker = (
  longitude: string | number,
  latitude: string | number,
  symbol = 'home'
) => {
  const markerSize = 'l'
  const markerColor = secondary.replace('#', '')
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

  const markerColor = secondary.replace('#', '')
  return `markers=color:0x${markerColor}%7Clabel:${label}%7C${latitude},${longitude}`
}

// const getGmapsSymbol = (property: Property) => {
//   const maki = getMakiSymbol(property)
//   return maki === 'home' ? 'H' : maki.charAt(0).toUpperCase()
// }

type StaticImageUrlParams = {
  point: ApiCoords
  property: Property
  width?: number
  height?: number
  zoom?: number
}

export const getMapboxStaticImageUrl = ({
  point,
  property,
  width = 560,
  height = 200,
  zoom = defaultAddressZoom
}: StaticImageUrlParams): string => {
  const { longitude, latitude } = point
  const imageSize = `${width}x${height}@2x`

  const symbol = getMakiSymbol(property)
  const marker = getMapboxStaticMarker(longitude, latitude, symbol)
  const staticStyleUrl = getMapboxStaticStyleUrl('hybrid')
  const staticImageUrl = `${staticStyleUrl}/${marker}/${longitude},${latitude},${zoom}/${imageSize}?access_token=${mapConfig.mapboxDefaults.accessToken}`

  return staticImageUrl
}

export const getGmapsStaticImageUrl = ({
  point,
  width = 560,
  height = 200,
  zoom = defaultAddressZoom
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

  const symbol = '' // getGmapsSymbol(property)

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

export const getMapUrl = ({
  center,
  zoom,
  layout = 'map',
  filters,
  query,
  page
}: {
  center: LngLat
  zoom: number
  layout?: 'map' | 'grid'
  filters?: Filters
  // synthetic query params used by page but not the API
  query?: string | null
  page?: number | string | null
}) => {
  const base = `${routes[layout]}?${formatCoords(center)}&z=${String(zoom).slice(0, 8)}`
  const nonEmptyFilters = getNonDefaultFilters(filters || {})

  const params = queryString.stringify(
    {
      ...nonEmptyFilters,
      page: Number(page) > 1 ? Number(page) : null,
      q: query
    },
    {
      arrayFormat: 'none',
      skipEmptyString: true,
      skipNull: true
    }
  )

  return params ? `${base}&${params}` : base
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

export const getMarkerName = (mlsNumber: string) => `marker-${mlsNumber}`

export const toMapboxPoint = (location: ApiCoords) => {
  const { latitude, longitude } = location
  return new mapboxgl.LngLat(longitude, latitude)
}

export const toApiPoint = (point: Point): ApiCoords => {
  const [longitude, latitude] = point.coordinates
  return { longitude, latitude }
}

export const toMapboxBounds = (bounds: ApiBounds, buffer = 0) => {
  const { top_left, bottom_right } = bounds

  return new mapboxgl.LngLatBounds(
    // converting mixed top_left coords to northeast (mapbox._NE)
    [top_left.longitude - buffer, bottom_right.latitude + buffer],
    // and mixed bottom_right to southwest (mapbox._SW)
    [bottom_right.longitude + buffer, top_left.latitude - buffer]
  )
}

export const toApiBounds = (bounds: LngLatBounds): ApiBounds => {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()

  return {
    top_left: { latitude: ne.lat, longitude: sw.lng },
    bottom_right: { latitude: sw.lat, longitude: ne.lng }
  }
}

export const toRectangle = (bounds: LngLatBounds, buffer = 0) => {
  /*
    map = [ ↗ NorthEast, ↖ NorthWest, ↙ SouthWest, ↘ SouthEast]
  */
  const ne = bounds.getNorthEast()
  const nw = bounds.getNorthWest()
  const sw = bounds.getSouthWest()
  const se = bounds.getSouthEast()

  // TODO: looks like buffer paddings are not set correctly
  const rectangle = [
    `[${ne.lng + buffer},${ne.lat + buffer}]`, // ↗
    `[${nw.lng - buffer},${nw.lat + buffer}]`, // ↖
    `[${sw.lng - buffer},${sw.lat - buffer}]`, // ↙
    `[${se.lng + buffer},${se.lat - buffer}]` //  ↘
  ]

  return `[[${rectangle.join(',')}]]`
}

export const getCenter = (bounds: ApiBounds) => {
  const { top_left, bottom_right } = bounds

  return new mapboxgl.LngLat(
    (top_left.longitude + bottom_right.longitude) / 2,
    (top_left.latitude + bottom_right.latitude) / 2
  )
}

export const getLngLatCenter = (bounds: LngLatBounds) =>
  getCenter(toApiBounds(bounds))

export const calcZoomLevel = (
  map: mapboxgl.Map,
  apiBounds: ApiBounds
): number => {
  const bounds = toMapboxBounds(apiBounds)
  const viewportWidth = map.getContainer().clientWidth
  const viewportHeight = map.getContainer().clientHeight

  const maxZoom = map.getMaxZoom()
  const minZoom = map.getMinZoom()

  const northeast = map.project(bounds.getNorthEast())
  const southwest = map.project(bounds.getSouthWest())

  const width = Math.abs(northeast.x - southwest.x)
  const height = Math.abs(southwest.y - northeast.y)

  const scaleWidth = viewportWidth / width
  const scaleHeight = viewportHeight / height
  const scale = Math.min(scaleWidth, scaleHeight)
  const zoom = Math.log2(scale) + map.getZoom()

  return Math.max(minZoom, Math.min(maxZoom, zoom))
}

export const calcZoomLevelForBounds = (
  bounds: LngLatBounds,
  width: number,
  height: number
) => {
  const dx = Math.abs(bounds.getEast() - bounds.getWest()) // longitude
  const dy = Math.abs(bounds.getSouth() - bounds.getNorth()) // latitude

  const zoomWidth = Math.log2((width * 180) / (dx * 256))
  const zoomHeight = Math.log2((height * 180) / (dy * 256))
  return Math.min(zoomWidth, zoomHeight)
}

export const calcBoundsAtZoom = (
  map: mapboxgl.Map,
  location: ApiCoords,
  zoom: number
): ApiBounds => {
  const EARTH_RADIUS = 6378137 // in meters
  const mapWidth = map.getContainer().clientWidth
  const mapHeight = map.getContainer().clientHeight

  const zoomPow = 2 ** (zoom + 1)

  const metersPerPixel =
    (2 *
      Math.PI *
      EARTH_RADIUS *
      Math.cos((location.latitude * Math.PI) / 180)) /
    (256 * zoomPow)

  const widthInMeters = mapWidth * metersPerPixel
  const heightInMeters = mapHeight * metersPerPixel

  const latDiff = (heightInMeters / EARTH_RADIUS) * (180 / Math.PI)
  const lngDiff =
    ((widthInMeters / EARTH_RADIUS) * (180 / Math.PI)) /
    Math.cos((location.latitude * Math.PI) / 180)

  const swLng = location.longitude - lngDiff / 2
  const swLat = location.latitude - latDiff / 2
  const neLng = location.longitude + lngDiff / 2
  const neLat = location.latitude + latDiff / 2

  const sw = new mapboxgl.LngLat(swLng, swLat)
  const ne = new mapboxgl.LngLat(neLng, neLat)

  return toApiBounds(new mapboxgl.LngLatBounds(sw, ne))
}

export const removePolygon = (map: MapboxMap) => {
  try {
    map.removeLayer('polygon-fill')
    map.removeLayer('polygon-outline')
    map.removeSource('polygon')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // TODO: not sure we need to handle this error. Mapbox cant control its own sources
  }
}

export const addPolygon = (map: MapboxMap, polygon: Position[]) => {
  if (polygon) {
    const polygonGeoJSON: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygon]
      },
      properties: {}
    }

    map.addSource('polygon', {
      type: 'geojson',
      data: polygonGeoJSON
    })

    map.addLayer({
      id: 'polygon-fill',
      type: 'fill',
      source: 'polygon',
      paint: {
        'fill-color': info,
        'fill-opacity': 0.25
      }
    })

    map.addLayer({
      id: 'polygon-outline',
      type: 'line',
      source: 'polygon',
      paint: {
        'line-color': lighten(info, 0.2),
        'line-width': 1.5
      }
    })
  }
}
