import type { FeatureCollection } from 'geojson'
import type { Map as MapboxMap } from 'mapbox-gl'

import type { OverlayLayerDefinition } from '@defaults/map'

import { overlayPolygonColor, overlayPolygonId } from 'utils/map/overlays'
import {
  addPolygonToMap,
  polygonFeature,
  removePolygonFromMap,
  type ResolvedPolygonConfig
} from 'utils/map/polygons'
import { styleReady } from 'utils/map/style'

// Preserve polygon features from prev that are absent in fresh (zoom-out case).
export const mergeWithPrevPolygons = (
  fresh: FeatureCollection,
  prev: FeatureCollection,
  prop: string
): FeatureCollection => {
  const freshIds = new Set(
    fresh.features
      .filter(polygonFeature)
      .map((f) => f.properties?.[prop] as string)
  )
  const preserved = prev.features.filter(
    (f) => polygonFeature(f) && !freshIds.has(f.properties?.[prop] as string)
  )
  return { ...fresh, features: [...fresh.features, ...preserved] }
}

type OverlayPolygonOverlay = Pick<
  OverlayLayerDefinition,
  'id' | 'polygon' | 'selectable' | 'color' | 'satellite'
>

const polygonConfig = ({
  id,
  polygon,
  selectable,
  color,
  satellite
}: OverlayPolygonOverlay): ResolvedPolygonConfig => ({
  ...polygon,
  // Single colour source: `polygon.color` override, else the overlay colour.
  color: overlayPolygonColor({ color, polygon }),
  // Satellite-mode polygon colour lives in the unified `satellite` section.
  satelliteColor: satellite?.polygon?.color,
  sourceId: overlayPolygonId(id),
  layerId: overlayPolygonId(id),
  // Polygon-select overlays paint with the 'polygon' context (hover-reveal +
  // select fill + deselect red).
  context: selectable === 'polygon' ? 'polygon' : undefined
})

// Data-driven: render whenever the overlay actually returns polygons. The `polygon`
// config only carries the "how" (colour / style / showOnMarkerHover).
const polygonsOnly = (data: FeatureCollection): FeatureCollection => ({
  type: 'FeatureCollection',
  features: data.features.filter(polygonFeature)
})

// Add/update an overlay's GL polygon layer (linked polygons, areas). Point markers are
// rendered separately as DOM markers, so this only handles the polygon features.
export const addOverlayPolygons = (
  map: MapboxMap,
  overlay: OverlayPolygonOverlay,
  data: FeatureCollection,
  dark: boolean
): void => {
  const polygonData = polygonsOnly(data)
  if (!polygonData.features.length) return
  addPolygonToMap(map, polygonConfig(overlay), polygonData, undefined, dark)
}

export const removeOverlayPolygons = (
  map: MapboxMap,
  { id, polygon }: OverlayPolygonOverlay
): void => {
  // Remove by id regardless of config — the polygon may have been rendered
  // data-driven even when the overlay has no `polygon` overrides.
  if (!styleReady(map)) return
  removePolygonFromMap(map, {
    ...polygon,
    sourceId: overlayPolygonId(id),
    layerId: overlayPolygonId(id)
  })
}
