import { type Position } from 'geojson'
import { type LngLatBounds } from 'mapbox-gl'

import filtersConfig from '@configs/filters'
import mapConfig from '@configs/map'
import searchConfig from '@configs/search'
import { bboxPolygon, featureCollection, intersect } from '@turf/turf'

import { type ApiLocation, type RawQuery } from 'services/API'
import { nonDefaultFilter } from 'utils/filters'
import { boundsToRing, getDefaultBounds } from 'utils/map'

import { type Filters, type MapPoint } from './types'

const {
  clusterLimit,
  clusterListingsThreshold,
  clusterPrecisionDelta,
  resultsPerPage
} = searchConfig
const { defaultAdvancedFilters, defaultFilters, listingFields } = filtersConfig

export const getListingFields = () => ({
  listings: true,
  fields: listingFields.join(',')
})

export const getClusterParams = (zoom: number) => ({
  aggregates: 'map',
  clusterLimit,
  clusterListingsThreshold,
  // shape of the listings inlined into small clusters — the same card field
  // set as the regular listings, so they render as full individual markers
  clusterFields: listingFields.join(','),
  clusterPrecision: Math.round(zoom) + clusterPrecisionDelta
})

export const getMapRectangle = (bounds: LngLatBounds) => ({
  map: boundsToRing(bounds)
})

export const getDefaultRectangle = () => ({
  map: boundsToRing(getDefaultBounds())
})

export const getMapPolygon = (
  polygons: Position[] | Position[][] | Position[][][]
): { map: Position[][] | Position[][][] } | Record<string, never> => {
  const first = polygons[0]

  // Single ring: Position[] -> wrap as [ring]
  if (typeof first[0] === 'number') {
    const ring: Position[] = polygons as Position[]
    return { map: [ring] }
  }

  // Repliers reads Position[][] as ONE polygon (outer ring + holes) and a
  // Position[][][] MultiPolygon as the union of its polygons, so a MultiPolygon
  // passes through as is — flattened, every polygon after the first is a hole.
  if (Array.isArray(first[0])) {
    return { map: polygons as Position[][] | Position[][][] }
  }

  return {}
}

// A Repliers `map` value as turf MultiPolygon coordinates. Flat rings (viewport
// rectangle, drawn polygon, loaded saved-search region) each become a polygon.
const toMultiPolygon = (map: Position[][] | Position[][][]): Position[][][] =>
  Array.isArray(map[0][0][0])
    ? (map as Position[][][])
    : (map as Position[][]).map((ring) => [ring])

// Repliers point+radius query params (km, fractional allowed). Only called for
// points that carry a radius (see getFetchBounds).
export const getMapPoint = (point: MapPoint) => {
  return {
    // Repliers expects lat/long as query-string values (ApiQueryParams types
    // them as strings); stringify here so the result stays assignable when a
    // caller passes it straight to a typed fetch (e.g. usePriceBuckets).
    lat: String(point.center[0]),
    long: String(point.center[1]),
    radius: point.radius ?? 0
  }
}

// Only legacy geo locations search listings by their boundary polygon. Overlay
// types (school, postalCode, district…) always filter by `locationId`, so keeping
// their stored `map.boundary` (needed to render the selection) never silently
// switches the listing query to a polygon search — interactive selection (no
// boundary) and a reloaded `locationId` (with boundary) resolve identically.
const polygonSearchTypes = new Set(['area', 'city', 'neighborhood'])

/**
 * Processes filters to extract boundaries for legacy geo locations with
 * boundaries. Removes matched ids from filters.locationId (they search by polygon
 * instead); overlay-type locations stay on the `locationId` filter.
 */
export const extractLocationPolygons = (
  filters: Filters,
  locations: ApiLocation[] | null
): { filters: Filters; polygons: Position[][][] } => {
  if (!locations?.length) return { filters, polygons: [] }

  const polygons: Position[][][] = []

  // location IDs
  const locationId = [filters.locationId].flat().filter((id) => {
    const loc = locations.find((l) => l.locationId === id)
    if (loc?.map?.boundary && polygonSearchTypes.has(loc.type)) {
      const boundary = loc.map.boundary
      if (boundary.length > 0 && Array.isArray(boundary[0][0])) {
        polygons.push(...(boundary as Position[][][]))
      } else {
        polygons.push(boundary as Position[][])
      }
      return false
    }
    return true
  }) as string[]

  return {
    filters: { ...filters, locationId },
    polygons
  }
}

/**
 * Removes resolved external overlay ids from filters and collects their
 * locations' boundary polygons. External ids never reach the API — their
 * geometry joins the listing query as a POST sub-query (see getSearchArea).
 * Ids whose location has not resolved a boundary yet contribute nothing;
 * fetch paths hold off while `unresolvedExternalIds` is non-empty.
 */
export const extractExternalPolygons = (
  filters: Filters,
  locations: ApiLocation[] | null
): { filters: Filters; polygons: Position[][][] } => {
  const ids = [filters.externalLocationId].flat().filter(Boolean) as string[]
  if (!ids.length) return { filters, polygons: [] }

  const polygons: Position[][][] = []
  ids.forEach((id) => {
    const boundary = locations?.find((l) => l.locationId === id)?.map?.boundary
    if (!boundary?.length) return
    const multi = (
      Array.isArray(boundary[0]?.[0]?.[0]) ? boundary : [boundary]
    ) as Position[][][]
    polygons.push(...multi)
  })

  const { externalLocationId: _externalLocationId, ...rest } = filters
  return { filters: rest, polygons }
}

/** External ids whose selected location has no boundary geometry yet —
 *  listings fetches wait for these to resolve (or be deselected). */
export const unresolvedExternalIds = (
  filters: Filters,
  locations: ApiLocation[] | null
): string[] =>
  ([filters.externalLocationId].flat().filter(Boolean) as string[]).filter(
    (id) =>
      !locations?.some((l) => l.locationId === id && l.map?.boundary?.length)
  )

/**
 * Clip external polygons to the current search region — the same turf
 * intersection `getFetchBounds` applies for the tenant boundary, so external
 * selections honour the on-screen rule the way native ones do (their ids AND
 * against the region server-side).
 */
const clipToRegion = (
  polygons: Position[][][],
  region: Position[][] | Position[][][]
): Position[][][] => {
  const clipped = intersect(
    featureCollection([
      {
        type: 'Feature' as const,
        geometry: { type: 'MultiPolygon' as const, coordinates: polygons },
        properties: {}
      },
      {
        type: 'Feature' as const,
        geometry: {
          type: 'MultiPolygon' as const,
          coordinates: toMultiPolygon(region)
        },
        properties: {}
      }
    ])
  )
  if (!clipped) return []
  const geom = clipped.geometry
  return geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates]
}

// Get bounds for fetch/search request (priority: point+radius > polygons > bounds > default)
export const getFetchBounds = (
  polygons?: Position[] | Position[][] | Position[][][] | null,
  point?: MapPoint | null,
  bounds?: LngLatBounds | null
) => {
  if (point?.radius) return getMapPoint(point)

  const { constrainToSearchBoundary } = searchConfig
  const { boundary } = mapConfig.searchArea

  if (!constrainToSearchBoundary || !boundary) {
    if (polygons?.length) return getMapPolygon(polygons)
    if (bounds) return getMapRectangle(bounds)
    return getDefaultRectangle()
  }

  // Build the boundary feature (always a MultiPolygon-style Position[][][])
  const boundaryFeature = featureCollection([
    {
      type: 'Feature' as const,
      geometry: { type: 'MultiPolygon' as const, coordinates: boundary },
      properties: {}
    }
  ])

  // Determine the user's spatial query as a GeoJSON feature
  let regionCoords: Position[][][] | null = null
  if (polygons?.length) {
    const poly = getMapPolygon(polygons)
    if (poly.map) regionCoords = toMultiPolygon(poly.map)
  } else if (bounds) {
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const rect = bboxPolygon([sw.lng, sw.lat, ne.lng, ne.lat])
    regionCoords = [rect.geometry.coordinates]
  }

  if (!regionCoords) return getMapPolygon(boundary)

  const regionFeature = featureCollection([
    {
      type: 'Feature' as const,
      geometry: { type: 'MultiPolygon' as const, coordinates: regionCoords },
      properties: {}
    }
  ])

  const clipped = intersect(
    featureCollection([regionFeature.features[0], boundaryFeature.features[0]])
  )
  if (!clipped) return getMapPolygon(boundary)

  const geom = clipped.geometry
  const clippedCoords: Position[][][] =
    geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates]
  return getMapPolygon(clippedCoords)
}

type SearchArea = {
  /** Drawn polygon (single ring) or a loaded saved-search region (rings). */
  polygon?: Position[] | Position[][] | null
  point?: MapPoint | null
  bounds?: LngLatBounds | null
  locations?: ApiLocation[] | null
}

type SearchAreaParams =
  | ReturnType<typeof getFetchBounds>
  | { queries: RawQuery[] }
  | (ReturnType<typeof getMapPoint> & { queries: RawQuery[] })

/**
 * Single source of truth for a listing query's search region. Runs location
 * polygon extraction (when the tenant enables it), then resolves the final
 * map/point params through getFetchBounds — which applies the
 * `constrainToSearchBoundary` clip. Both the results search and the
 * advanced-filters count/buckets preview go through this, so their region (and
 * boundary clip) can never diverge again (MOV-191).
 *
 * External overlay selections (schools…) switch the request to POST `queries`
 * mode: `locationId` + `map=` at the top level INTERSECT server-side, while
 * queries UNION — and a top-level `map` conflicts with a query `map` (API 400).
 * So the region moves inside the native-ids query and the external polygons,
 * clipped to the region client-side, form a second query.
 */
export const getSearchArea = (
  filters: Filters,
  { polygon, point, bounds, locations }: SearchArea
): { filters: Filters; area: SearchAreaParams } => {
  const external = extractExternalPolygons(filters, locations ?? null)
  const extracted = searchConfig.extractLocationPolygons
    ? extractLocationPolygons(external.filters, locations ?? null)
    : { filters: external.filters, polygons: [] as Position[][][] }

  // A resolved location boundary replaces the drawn/viewport region and carries
  // its matched ids out of `filters` (they now search by polygon, not id).
  const area = extracted.polygons.length
    ? getFetchBounds(extracted.polygons, point, bounds)
    : getFetchBounds(polygon ?? null, point, bounds)

  if (!external.polygons.length) {
    // Legacy request, unchanged. `filters` keeps its original identity when no
    // location extraction ran.
    return { filters: extracted.filters, area }
  }

  const nativeIds = [extracted.filters.locationId]
    .flat()
    .filter(Boolean) as string[]
  const { locationId: _locationId, ...queryFilters } = extracted.filters
  const queries: RawQuery[] = []

  if (!('map' in area)) {
    // Point+radius region: its GET params AND with every query, so the ids and
    // the (unclipped) external polygons union under the shared radius.
    if (nativeIds.length) queries.push({ locationId: nativeIds })
    queries.push(getMapPolygon(external.polygons) as RawQuery)
    return { filters: queryFilters, area: { ...area, queries } }
  }

  if (nativeIds.length) {
    queries.push({ locationId: nativeIds, map: area.map })
  }
  const clipped = clipToRegion(external.polygons, area.map)
  if (clipped.length) {
    queries.push(getMapPolygon(clipped) as RawQuery)
  } else if (!nativeIds.length) {
    // Selection fully off-screen with nothing else selected: send the unclipped
    // polygons so the grid still lists the selection's listings.
    queries.push(getMapPolygon(external.polygons) as RawQuery)
  }

  return { filters: queryFilters, area: { queries } }
}

export const getPageParams = (pageNum: number = 1) => ({
  pageNum,
  resultsPerPage
})

export const getNonDefaultFilters = (
  filters: Filters,
  defaults: Filters = { ...defaultAdvancedFilters, ...defaultFilters }
): Filters =>
  Object.fromEntries(
    Object.entries(filters).filter((entry) => {
      return nonDefaultFilter(entry, defaults)
    })
  ) as Filters
