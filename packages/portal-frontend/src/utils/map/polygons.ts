import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position
} from 'geojson'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import type { OverlayPolygonConfig } from '@defaults/map'
import { booleanPointInPolygon, kinks, union, unkinkPolygon } from '@turf/turf'

import { markerLinkId } from './overlays'
import {
  type PolygonContext,
  type PolygonPaint,
  resolvePolygonStyle
} from './resolvePolygonStyle'
import { executeOnStyleLoad, styleReady } from './style'

export const polygonFeature = (f: { geometry: { type: string } }): boolean =>
  f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'

const polygonFillSuffix = '-fill'
const polygonOutlineSuffix = '-outline'

const addFillLineLayers = (
  map: MapboxMap,
  source: string,
  fillId: string,
  outlineId: string,
  style: PolygonPaint,
  beforeId?: string
) => {
  if (map.getLayer(fillId) || map.getLayer(outlineId)) return

  map.addLayer(
    {
      source,
      id: fillId,
      type: 'fill',
      paint: {
        'fill-color': style['fill-color'],
        'fill-opacity': style['fill-opacity']
      }
    },
    beforeId
  )

  map.addLayer(
    {
      source,
      id: outlineId,
      type: 'line',
      paint: {
        'line-color': style['line-color'],
        'line-width': style['line-width'],
        'line-opacity': style['line-opacity']
      }
    },
    beforeId
  )
}

export type ResolvedPolygonConfig = OverlayPolygonConfig & {
  sourceId: string
  layerId: string
  /** Main colour in satellite/hybrid mode, from the overlay's `satellite.polygon.color`. */
  satelliteColor?: string
  /** Explicit paint context; defaults to `polygon` (showOnMarkerHover) or `static`. */
  context?: PolygonContext
}

// Creates the source and its fill + line layers, or updates the source in place.
const drawPolygon = (
  map: MapboxMap,
  polygon: ResolvedPolygonConfig,
  data: FeatureCollection,
  beforeId?: string,
  dark = false
) => {
  const { sourceId, layerId } = polygon
  const fillId = `${layerId}${polygonFillSuffix}`
  const outlineId = `${layerId}${polygonOutlineSuffix}`

  const polygonData: FeatureCollection = {
    type: 'FeatureCollection',
    features: data.features.filter(polygonFeature)
  }

  if (map.getSource(sourceId)) {
    ;(map.getSource(sourceId) as GeoJSONSource).setData(polygonData)
    return
  }

  // Marker-linked and polygon-select overlays share one interactive `polygon`
  // context (hover-reveal + select fill + deselect red); standalone polygons are
  // always visible (`static`). An explicit `context` overrides. Colour and widths
  // come from the shared polygonStyle cascade.
  const context =
    polygon.context ?? (polygon.showOnMarkerHover ? 'polygon' : 'static')
  const paint = resolvePolygonStyle(context, {
    color: polygon.color,
    satelliteColor: polygon.satelliteColor,
    style: polygon.style,
    dark
  })

  // Use stable property-based IDs so feature-state survives setData: the linked
  // marker's id property, or `locationId` for polygon-select overlays. Falls back
  // to generateId for plain standalone polygons.
  const promoteId =
    markerLinkId(polygon) ?? (context === 'polygon' ? 'locationId' : undefined)
  map.addSource(sourceId, {
    type: 'geojson',
    data: polygonData,
    ...(promoteId ? { promoteId } : { generateId: true })
  })

  addFillLineLayers(map, sourceId, fillId, outlineId, paint, beforeId)
}

/**
 * The single renderer for every static GL polygon — user-drawn search area, loaded
 * boundaries, overlay areas, selected locations, the point-radius circle. Idempotent:
 * an existing source is updated via `setData`. Draws as soon as the stylesheet accepts
 * layers — at once when it already does, inside a `style.load` handler included — and
 * before the initial load (a URL-seeded polygon) waits for `style.load`.
 */
export const addPolygonToMap = (
  map: MapboxMap,
  polygon: ResolvedPolygonConfig,
  data: FeatureCollection,
  beforeId?: string,
  dark = false
) =>
  executeOnStyleLoad(map, () => drawPolygon(map, polygon, data, beforeId, dark))

export const removePolygonFromMap = (
  map: MapboxMap,
  polygon: ResolvedPolygonConfig
) => {
  if (!styleReady(map)) return
  const { sourceId, layerId } = polygon
  const fillId = `${layerId}${polygonFillSuffix}`
  const outlineId = `${layerId}${polygonOutlineSuffix}`
  if (map.getLayer(fillId)) map.removeLayer(fillId)
  if (map.getLayer(outlineId)) map.removeLayer(outlineId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)
}

// --- User-drawn / boundary search polygon: a single GL source in the base style ---

// Empty colour → resolvePolygonStyle keeps the base (search-area) palette.
const searchPolygonConfig = {
  sourceId: 'draw-polygon',
  layerId: 'draw-polygon',
  color: '',
  context: 'static' as const
}

// Each boundary is a single ring (`Position[]`) or a polygon with holes
// (`Position[][]`); wrap the former so both become Polygon coordinates.
const ringsToFeatureCollection = (
  boundaries: (Position[] | Position[][])[]
): FeatureCollection => ({
  type: 'FeatureCollection',
  features: boundaries.map((boundary): Feature => {
    const coordinates: Position[][] = Array.isArray(boundary[0]?.[0])
      ? (boundary as Position[][])
      : ([boundary] as Position[][])
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates }
    }
  })
})

/**
 * A ring as simple geometry. Mapbox triangulates fills with earcut, which expects
 * simple rings — a self-crossing ring (a figure-8) fills wrongly. It is split into
 * simple pieces and merged back: one Polygon (a loop drawn twice → its outline)
 * or a MultiPolygon of lobes (a figure-8).
 */
export const untangle = (ring: Position[]): Polygon | MultiPolygon => {
  const drawn: Polygon = { type: 'Polygon', coordinates: [ring] }
  if (!kinks(drawn).features.length) return drawn
  try {
    return union(unkinkPolygon(drawn))?.geometry ?? drawn
  } catch {
    // A ring that only touches itself (a vertex on an edge, a vertex visited
    // twice) is reported by `kinks` but rejected by unkink/union — keep it
    return drawn
  }
}

/** Draws the user-drawn single-ring search polygon (untangled, so a figure-8
 *  fills both lobes). */
export const addPolygon = (map: MapboxMap, polygon: Position[]) => {
  addPolygonToMap(map, searchPolygonConfig, {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: untangle(polygon) }]
  })
}

// A boundary arrives as a single polygon (`Position[][]`) or a multi-polygon
// (`Position[][][]`); normalize both into one FeatureCollection.
const boundaryCollection = (
  boundary: Position[][][] | Position[][]
): FeatureCollection => {
  const singlePolygon = !Array.isArray(boundary[0]?.[0]?.[0])
  const normalized = (singlePolygon ? [boundary] : boundary) as Position[][][]
  return ringsToFeatureCollection(normalized)
}

/** Draws a saved-search / location boundary (single- or multi-polygon). */
export const addBoundaryPolygon = (
  map: MapboxMap,
  boundary: Position[][][] | Position[][]
) => addPolygonToMap(map, searchPolygonConfig, boundaryCollection(boundary))

// A saved-search `map` is a FLAT list of rings: the save path (`unionAreas`)
// flattened the merged selection, so several disjoint areas AND a single area's
// holes both land in the same array, with nothing marking which is which.
// Reconstruct the grouping geometrically — a ring whose vertex sits inside
// another ring is that ring's hole; a ring inside nothing is a separate outer
// polygon. This renders BOTH cases right (separate filled areas AND donut
// cut-outs); any single global interpretation gets one of them wrong.
const ringInside = (outer: Position[], inner: Position[]): boolean =>
  booleanPointInPolygon(inner[0], { type: 'Polygon', coordinates: [outer] })

export const groupRingsByContainment = (
  rings: Position[][]
): Position[][][] => {
  const hole = rings.map((ring, index) =>
    rings.some((other, j) => index !== j && ringInside(other, ring))
  )
  const outers = rings.filter((_, index) => !hole[index])
  const holes = rings.filter((_, index) => hole[index])
  return outers.map((outer) => [
    outer,
    ...holes.filter((inner) => ringInside(outer, inner))
  ])
}

/** Draws a loaded saved-search region — a flat ring list regrouped into proper
 *  polygons with holes, so separate areas fill independently and inner rings cut
 *  out. Matches the listings query and the saved-search thumbnail. */
export const addRegionPolygon = (map: MapboxMap, region: Position[][]) =>
  addPolygonToMap(
    map,
    searchPolygonConfig,
    ringsToFeatureCollection(groupRingsByContainment(region))
  )

export const removePolygon = (map: MapboxMap) =>
  removePolygonFromMap(map, searchPolygonConfig)
