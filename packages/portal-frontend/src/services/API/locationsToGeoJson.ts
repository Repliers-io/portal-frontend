import type { Feature, FeatureCollection, Position } from 'geojson'

import type { ApiLocation } from './types'

type Options = { markers?: boolean }

// Outer-ring extent [west, south, east, north] of a polygon boundary. Carried
// on point/marker properties as four scalars so the selection can frame the real
// polygon (its `bounds`) without shipping the heavy geometry — and without the
// listing query switching to a polygon search, which keys off `map.boundary`
// (markers deliberately drop that; the bbox lives in `bounds`, not `boundary`).
const boundaryBbox = (
  boundary: Position[][][] | Position[][]
): [number, number, number, number] | null => {
  const multi = (
    Array.isArray(boundary[0]?.[0]?.[0]) ? boundary : [boundary]
  ) as Position[][][]
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  for (const polygon of multi) {
    for (const [lng, lat] of polygon[0] ?? []) {
      if (lng < west) west = lng
      if (lng > east) east = lng
      if (lat < south) south = lat
      if (lat > north) north = lat
    }
  }
  return Number.isFinite(west) ? [west, south, east, north] : null
}

// `map` holds geometry (moved into the feature), `demographics`/`metrics` are
// heavy nested data unused by overlays — all excluded from feature properties.
// `map.longitude/latitude` are included so polygon-hover tooltips can anchor
// the popup at the server-supplied centre without computing a centroid;
// `bbox` is included so marker selection can frame the polygon.
const buildProperties = (location: ApiLocation): Record<string, unknown> => {
  const {
    map: locationMap,
    demographics: _demographics,
    school,
    ...rest
  } = location
  const properties: Record<string, unknown> = { ...rest }
  // Uniform marker↔polygon link key (see `markerLinkId`): expose the location id
  // as `id` on both the point and polygon features, so overlay configs only flip
  // `showOnMarkerHover` on — they never name a property.
  properties.id = location.locationId
  const longitude = Number(locationMap?.longitude)
  const latitude = Number(locationMap?.latitude)
  if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
    properties.longitude = longitude
    properties.latitude = latitude
  }
  if (locationMap?.boundary) {
    const bbox = boundaryBbox(locationMap.boundary)
    if (bbox) properties.bbox = bbox
  }
  if (school) {
    const { metrics: _metrics, ...schoolScalars } = school
    Object.assign(properties, schoolScalars)
  }
  return properties
}

// After APILocations normalization, `boundary` is Position[][][] (MultiPolygon
// coords). Guard for an un-normalized single polygon just in case.
export const toMultiPolygon = (boundary: Position[][][] | Position[][]) => {
  const multi = (
    Array.isArray(boundary[0]?.[0]?.[0]) ? boundary : [boundary]
  ) as Position[][][]
  return { type: 'MultiPolygon' as const, coordinates: multi }
}

/**
 * Converts a Repliers `/locations` response to GeoJSON. Every location with a
 * `map.boundary` yields a polygon feature; with `markers: true` every location
 * also yields a point feature from its lat/lng (school overlays). Feature
 * properties carry the location scalars and, for schools, the flattened
 * `school.*` scalars (heavy `metrics.*` excluded).
 */
export const locationsToGeoJson = (
  locations: ApiLocation[],
  { markers = false }: Options = {}
): FeatureCollection => {
  const features: Feature[] = []

  for (const location of locations) {
    const properties = buildProperties(location)
    const boundary = location.map?.boundary

    if (boundary) {
      features.push({
        type: 'Feature',
        geometry: toMultiPolygon(boundary),
        properties
      })
    }

    if (markers) {
      const longitude = Number(location.map?.longitude)
      const latitude = Number(location.map?.latitude)
      if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
          properties
        })
      }
    }
  }

  return { type: 'FeatureCollection', features }
}
