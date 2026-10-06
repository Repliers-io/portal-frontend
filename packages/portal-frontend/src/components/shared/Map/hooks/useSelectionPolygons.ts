import { useCallback, useEffect, useRef } from 'react'
import type { Feature, FeatureCollection, Position } from 'geojson'

import mapConfig from '@configs/map'
import type { OverlayLayerDefinition } from '@defaults/map'

import { type ApiLocation } from 'services/API'
import {
  useMapLayers,
  useMapLocations,
  useMapOptions
} from 'providers/MapOptionsProvider'
import { addPolygonToMap, removePolygonFromMap } from 'utils/map/polygons'

import { useMapListener } from './useMapListener'
import { overlayForLocation } from './useOverlaySelectsLocation'

const selectionSourceId = 'selection-polygons'

// Empty colour → resolvePolygonStyle keeps the base (default) palette.
const selectionConfig = {
  sourceId: selectionSourceId,
  layerId: selectionSourceId,
  color: '',
  context: 'selection' as const
}

/**
 * The selected locations the unified renderer draws itself: those carrying a
 * boundary that are NOT covered by an ACTIVE `selectable` overlay (a selected
 * school whose Schools layer is on is rendered by that overlay instead, in its
 * colour). Pure — unit tested.
 */
export const selectionToRender = (
  locations: ApiLocation[] | null,
  activeLayers: Set<string>,
  overlays: OverlayLayerDefinition[]
): ApiLocation[] =>
  (locations ?? []).filter((loc) => {
    if (!loc.map?.boundary?.length) return false
    const overlay = overlayForLocation(overlays, loc.type)
    return !overlay || !activeLayers.has(overlay.id)
  })

const toPolygonFeature = (loc: ApiLocation): Feature => {
  const boundary = loc.map!.boundary!
  const coordinates = (
    Array.isArray(boundary[0]?.[0]?.[0]) ? boundary : [boundary]
  ) as Position[][][]
  return {
    type: 'Feature',
    geometry: { type: 'MultiPolygon', coordinates },
    properties: { locationId: loc.locationId, name: loc.name, type: loc.type }
  }
}

/**
 * Renders selected-location boundaries that no active overlay draws, on a single
 * `selection` GL source in the default *selected* style. Replaces the deleted
 * generic `useLocationBoundaries` — same single renderer (`addPolygonToMap`) as
 * the overlay polygons, just fed from the stored selection geometry.
 */
export const useSelectionPolygons = () => {
  const { mapRef } = useMapOptions()
  const { locations } = useMapLocations()
  const { activeLayers } = useMapLayers()

  const ref = useRef({ locations, activeLayers })
  ref.current = { locations, activeLayers }

  const render = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const { locations, activeLayers } = ref.current
    const toRender = selectionToRender(
      locations,
      activeLayers as Set<string>,
      mapConfig.overlays.layers
    )
    if (!toRender.length) {
      removePolygonFromMap(map, selectionConfig)
      return
    }
    const data: FeatureCollection = {
      type: 'FeatureCollection',
      features: toRender.map(toPolygonFeature)
    }
    addPolygonToMap(map, selectionConfig, data)
  }, [mapRef])

  useEffect(() => {
    render()
  }, [locations, activeLayers, render])

  // Render once the map is ready and re-render after a style change wipes GL sources.
  useMapListener(mapRef, (map) => {
    render()
    map.on('style.load', render)
  })
}
