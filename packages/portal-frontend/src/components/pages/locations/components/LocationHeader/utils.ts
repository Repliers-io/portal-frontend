import { type Feature, type MultiPolygon, type Position } from 'geojson'
import { type LngLatLike } from 'mapbox-gl'

import locationConfig from '@configs/location'
import mapConfig from '@configs/map'
import { simplify } from '@turf/turf'

import { type ApiLocation } from 'services/API'
import {
  getDefaultBounds,
  getLngLatCenter,
  getLocationExtent,
  getMapUrl,
  toMapboxPoint
} from 'utils/map'

const { zoom } = mapConfig

export const resolveZoom = (location: ApiLocation): number => {
  const { locationHover } = zoom
  if (location.type === 'neighborhood') return locationHover.hood
  if (location.type === 'city') {
    const isMainCity =
      location.name.toLowerCase() === locationConfig.city.toLowerCase()
    return isMainCity ? locationHover.mainCity : locationHover.city
  }
  return zoom.areaFallback
}

/**
 * Normalize raw boundary to MultiPolygon coordinates (Position[][][]).
 * API may return either:
 *   - Polygon coords: Position[][]   → wrap as [boundary]
 *   - MultiPolygon coords: Position[][][] → use as-is
 * Detection: leaf at depth 3 is a number for Polygon, an array for MultiPolygon.
 */
const toMultiPolygonCoords = (
  boundary: Position[][][] | Position[][]
): Position[][][] => {
  const leaf = (boundary as Position[][])[0]?.[0]?.[0]
  if (typeof leaf === 'number') return [boundary as Position[][]]
  return boundary as Position[][][]
}

export const simplifyBoundary = (
  boundary: Position[][][] | Position[][]
): Position[][][] => {
  const coordinates = toMultiPolygonCoords(boundary)
  const feature: Feature<MultiPolygon> = {
    type: 'Feature',
    geometry: { type: 'MultiPolygon', coordinates },
    properties: {}
  }
  return simplify(feature, { tolerance: 0.001, highQuality: false }).geometry
    .coordinates
}

const bboxBoundary = (boundary: Position[][][] | Position[][]) => {
  const coords = toMultiPolygonCoords(boundary)
  return (
    coords.length === 1 && coords[0].length === 1 && coords[0][0].length === 5
  )
}

export const toMapState = (
  loc: ApiLocation | undefined
): {
  center?: LngLatLike
  zoom?: number
  boundary?: Position[][][]
} => {
  if (loc?.map?.boundary?.length && !bboxBoundary(loc.map.boundary)) {
    return { boundary: simplifyBoundary(loc.map.boundary) }
  }

  if (loc?.map?.latitude && loc?.map?.longitude) {
    return {
      center: { lng: loc.map.longitude, lat: loc.map.latitude },
      zoom: resolveZoom(loc)
    }
  }
  return {}
}

/**
 * "Explore map" target for a location. `toMapState` yields no centre whenever the
 * location carries a polygon (the header map frames it via fitBounds instead), so
 * derive the camera from the location's own extent and carry `locationId` — the
 * map page resolves it and outlines the location.
 */
export const getLocationMapUrl = (loc?: ApiLocation) => {
  const extent = loc && getLocationExtent(loc)
  const coords = loc?.map?.latitude && loc.map.longitude ? loc.map : undefined
  const center = extent
    ? getLngLatCenter(extent)
    : coords && toMapboxPoint(coords)

  if (!loc || !center)
    return getMapUrl({
      center: getLngLatCenter(getDefaultBounds()),
      zoom: zoom.areaFallback
    })

  return getMapUrl({ center, zoom: resolveZoom(loc), location: loc })
}
