import { type Position } from 'geojson'
import mapboxgl, { type LngLat, type LngLatBounds } from 'mapbox-gl'

import mapConfig from '@configs/map'

import { type ApiBounds, type ApiLocation } from 'services/API'
import { type MapPoint } from 'services/Search'
import { type MapPosition } from 'providers/MapOptionsProvider'

import { toApiBounds } from './converters'
import { type Polygon } from './types'

/**
 * @description Function to convert custom polygon object from '@configs/map' module to mapbox bounds
 */
export const getPolygonBounds = (polygon: Polygon) => {
  const { tl, br } = polygon.reduce(
    (acc, point) => {
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
  return getPolygonBounds(mapConfig.searchArea.defaultPolygon)
}

export const getBoundaryBounds = (
  boundary: Position[][][] | Position[][]
): LngLatBounds => {
  if (!boundary?.length) return getDefaultBounds()

  const singlePolygon = !Array.isArray(boundary[0]?.[0]?.[0])
  const normalizedBoundary = (
    singlePolygon ? [boundary] : boundary
  ) as Position[][][]

  const validBoundary = normalizedBoundary.filter(
    (polygon) => polygon[0]?.length > 0
  )
  if (!validBoundary.length) return getDefaultBounds()

  const allPositions = validBoundary.flatMap((polygon) => polygon[0] || [])
  return getPositionBounds(allPositions)
}

/**
 * @description Combines multiple LngLatBounds into a single bounds that encompasses all of them
 * @param bounds Array of LngLatBounds to combine
 * @returns Combined LngLatBounds or null if array is empty
 */
export const getCombinedBounds = (
  bounds: LngLatBounds[]
): LngLatBounds | null => {
  if (bounds.length === 0) return null

  // Extract all corner points from all bounds
  const allCorners = bounds.flatMap((b) => [
    [b.getWest(), b.getSouth()], // Southwest corner
    [b.getEast(), b.getNorth()] // Northeast corner
  ])

  return getPositionBounds(allCorners)
}

// Padding box around a point-only location (overlay markers carry a centre but
// no boundary), so each selected point still contributes to the combined bounds.
const POINT_BOUNDS_RADIUS_KM = 2

/**
 * Camera-framing bounds for a MapPoint: a box around its centre sized by the
 * point's radius, or padded with POINT_BOUNDS_RADIUS_KM for a radius-less
 * (address) point so the framing lands at a sane zoom rather than a zero-area box.
 */
export const getPointBounds = (point: MapPoint) => {
  const [lat, lng] = point.center
  const radiusKm = point.radius ?? POINT_BOUNDS_RADIUS_KM
  const radiusInDegrees = radiusKm / 111.32
  const lngRadius = radiusInDegrees / Math.cos((lat * Math.PI) / 180)

  return getPolygonBounds([
    { lat: lat + radiusInDegrees, lng: lng + lngRadius },
    { lat: lat + radiusInDegrees, lng: lng - lngRadius },
    { lat: lat - radiusInDegrees, lng: lng - lngRadius },
    { lat: lat - radiusInDegrees, lng: lng + lngRadius }
  ])
}

/**
 * A location's known rectangular extent for camera framing, preferring the
 * search-neutral `bounds` (API bbox / address / polygon bbox) over
 * deriving it from the `map.boundary` geometry. Returns null for point-only or
 * positionless locations — callers decide whether to fetch real bounds or pad a
 * point (see `getLocationsBounds`).
 */
export const getLocationExtent = (loc: ApiLocation): LngLatBounds | null => {
  if (loc.bounds) return loc.bounds
  if (loc.map?.boundary?.length) return getBoundaryBounds(loc.map.boundary)
  return null
}

// Frame a point-only location by its centre (e.g. a marker without a
// polygon bbox) so it still contributes to a combined selection extent.
const pointExtent = (loc: ApiLocation): LngLatBounds | null => {
  const lat = Number(loc.map?.latitude)
  const lng = Number(loc.map?.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? getPointBounds({ center: [lat, lng], radius: POINT_BOUNDS_RADIUS_KM })
    : null
}

// The marker centre as a degenerate (zero-area) bound. A marker can
// rarely sit OUTSIDE its linked polygon; including its centre keeps the
// clicked marker in the recenter frame alongside the polygon.
const markerPointBounds = (loc: ApiLocation): LngLatBounds | null => {
  const lat = Number(loc.map?.latitude)
  const lng = Number(loc.map?.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? new mapboxgl.LngLatBounds([lng, lat], [lng, lat])
    : null
}

export const getLocationsBounds = (locations: ApiLocation[]) => {
  const allBounds = locations
    .flatMap((loc) => {
      const extent = getLocationExtent(loc)
      // With a real extent (polygon/area) also pull in the marker centre — it
      // can lie outside the polygon. Without one, pad the lone point instead.
      return extent ? [extent, markerPointBounds(loc)] : [pointExtent(loc)]
    })
    .filter((b): b is LngLatBounds => Boolean(b))
  return getCombinedBounds(allBounds)
}

/**
 * @description Calculates the radius in kilometers from map position bounds
 * by measuring the distance from center to northeast corner (diagonal).
 * This gives us the circumscribed circle radius that fully contains the bounds rectangle.
 */
export const getPositionRadius = (position: MapPosition) => {
  const { bounds, center } = position
  if (!bounds || !center) return 0
  const ne = (bounds as LngLatBounds).getNorthEast()
  const radius = (center as LngLat).distanceTo(ne) / 1000
  return radius
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
  bounds: LngLatBounds
): number => {
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
  center: LngLat,
  zoom: number
): LngLatBounds => {
  const EARTH_RADIUS = 6378137 // in meters
  const mapWidth = map.getContainer().clientWidth
  const mapHeight = map.getContainer().clientHeight

  const zoomPow = 2 ** (zoom + 1)

  const metersPerPixel =
    (2 * Math.PI * EARTH_RADIUS * Math.cos((center.lat * Math.PI) / 180)) /
    (256 * zoomPow)

  const widthInMeters = mapWidth * metersPerPixel
  const heightInMeters = mapHeight * metersPerPixel

  const latDiff = (heightInMeters / EARTH_RADIUS) * (180 / Math.PI)
  const lngDiff =
    ((widthInMeters / EARTH_RADIUS) * (180 / Math.PI)) /
    Math.cos((center.lat * Math.PI) / 180)

  const swLng = center.lng - lngDiff / 2
  const swLat = center.lat - latDiff / 2
  const neLng = center.lng + lngDiff / 2
  const neLat = center.lat + latDiff / 2

  const sw = new mapboxgl.LngLat(swLng, swLat)
  const ne = new mapboxgl.LngLat(neLng, neLat)

  return new mapboxgl.LngLatBounds(sw, ne)
}

const BOUNDS_PADDING_PX = 60

// Camera moves that land on a place (a location, a tapped marker). Mapbox's default
// `ease` covers ~40% of the way in the first quarter, which a render at the tap
// swallows; this curve covers ~6% there, so the move reads start to finish.
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

type FitBoundsOptions = {
  padding?: number
  minDuration?: number
  /** `false` snaps to the bounds instantly, ignoring the fly curve and duration. */
  animate?: boolean
  /** Fly speed (screenfuls/sec). Mapbox default is 1.2; higher = faster. `fitBounds` flies internally, so this applies. */
  speed?: number
}

/**
 * @description Fit map to bounds with standard fly curve animation and padding
 * Uses retainPadding: false to prevent padding from persisting in map state
 * @see https://docs.mapbox.com/mapbox-gl-js/api/properties/#paddingoptions
 * @param map Mapbox map instance
 * @param bounds Bounds to fit to
 */
export const fitBounds = (
  map: mapboxgl.Map,
  bounds: LngLatBounds,
  {
    padding = BOUNDS_PADDING_PX,
    minDuration,
    animate = true,
    speed
  }: FitBoundsOptions = {}
) => {
  const { mapFlyCurve } = mapConfig
  const paddingObj = {
    top: padding,
    bottom: padding,
    left: padding,
    right: padding
  }

  let duration: number | undefined
  if (minDuration !== undefined) {
    const camera = map.cameraForBounds(bounds, { padding: paddingObj })
    if (camera) {
      const currentPx = map.project(map.getCenter())
      const targetPx = map.project(camera.center as mapboxgl.LngLatLike)
      const dx = currentPx.x - targetPx.x
      const dy = currentPx.y - targetPx.y
      const pixelDist = Math.sqrt(dx * dx + dy * dy)
      const zoomDelta = Math.abs(map.getZoom() - (camera.zoom ?? map.getZoom()))
      const estimated = pixelDist * 0.8 + zoomDelta * 150
      // Only enforce the minimum — if Mapbox would naturally animate longer, don't constrain it.
      if (estimated < minDuration) duration = minDuration
    } else {
      duration = minDuration
    }
  }

  map.fitBounds(bounds, {
    ...mapFlyCurve,
    easing: easeInOutCubic,
    padding: paddingObj,
    retainPadding: false,
    animate,
    ...(speed !== undefined ? { speed } : {}),
    ...(duration !== undefined ? { duration } : {})
  })
}
