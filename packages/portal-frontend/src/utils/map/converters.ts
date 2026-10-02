import { type Point, type Position } from 'geojson'
import mapboxgl, { type LngLatBounds } from 'mapbox-gl'

import { type ApiBounds, type ApiCoords } from 'services/API'
import { calculateDistance } from 'utils/geo'

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

// Returns the bounding rectangle as a native Position[][] (one ring, NE-NW-SW-SE order).
// Use this when the map= param goes into POST body (no JSON.stringify needed).
export const boundsToRing = (bounds: LngLatBounds): Position[][] => {
  const ne = bounds.getNorthEast()
  const nw = bounds.getNorthWest()
  const sw = bounds.getSouthWest()
  const se = bounds.getSouthEast()
  return [
    [
      [ne.lng, ne.lat],
      [nw.lng, nw.lat],
      [sw.lng, sw.lat],
      [se.lng, se.lat]
    ]
  ]
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

// Convert Google Maps zoom level to Mapbox zoom level
export const toMapboxZoom = (googleZoom: number): number => {
  // Reverse conversion: subtract the offset used in toGoogleZoom
  const mapboxZoom = googleZoom - 1.25
  // Clamp to Mapbox valid range (0-22)
  return Math.max(0, Math.min(22, mapboxZoom))
}

/**
 * Viewport center plus the radius (km) that covers it — the great-circle
 * distance from the center to the north-east corner. Used for center+radius
 * `/locations` queries. Distance is computed via the shared `calculateDistance`.
 */
export const boundsToCenterRadius = (
  bounds: LngLatBounds
): { lat: number; long: number; radius: number } => {
  const center = bounds.getCenter()
  const ne = bounds.getNorthEast()
  return {
    lat: center.lat,
    long: center.lng,
    radius: Math.ceil(calculateDistance(center, ne))
  }
}
