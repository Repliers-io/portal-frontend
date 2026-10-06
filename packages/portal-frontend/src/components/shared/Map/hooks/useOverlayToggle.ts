import mapConfig from '@configs/map'
import type { OverlayLayerDefinition } from '@defaults/map'

import { useMapLayers, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

import { useLocationSelection } from './useLocationSelection'

/**
 * On/off toggle for a single overlay layer — shared by the `MapLayersMenu` row and
 * the standalone `OverlayToggleButton`. Carries the activation-zoom guard: enabling
 * a zoom-gated layer below its `activationMinZoom` first flies the map up to it.
 * Hiding a selectable overlay also drops its selected locations so the map and
 * result set stay consistent — unless the tenant keeps them via `persistOverlaySelection`.
 */
export const useOverlayToggle = (layer: OverlayLayerDefinition) => {
  const { activeLayers, loadingLayers, toggleLayer } = useMapLayers()
  const { mapRef } = useMapOptions()
  const { removeLocationsByType } = useLocationSelection()
  const { polygonPresent } = useSearch()

  const active = activeLayers.has(layer.id)
  const loading = loadingLayers.has(layer.id)
  // A drawn/loaded search polygon and location selection are mutually exclusive.
  // Block enabling a selectable overlay (one that produces locations) while a
  // polygon exists; an already-on layer stays toggle-able so it can be turned off.
  const blocked =
    polygonPresent && !active && Boolean(layer.locationTypes?.length)

  const toggle = () => {
    if (blocked) return
    if (!active && layer.activationMinZoom !== undefined) {
      const zoom = mapRef.current?.getZoom()
      if (zoom !== undefined && zoom < layer.activationMinZoom) {
        mapRef.current?.easeTo({ zoom: layer.activationMinZoom })
      }
    }
    toggleLayer(layer.id)
    // Just hid a selectable overlay → drop its selected locations of this layer's
    // types (default) so the result set + map stay consistent. Tenants that persist
    // the selection visuals instead opt out via `persistOverlaySelection`.
    if (active && !mapConfig.overlays.persistSelection && layer.locationTypes) {
      removeLocationsByType(layer.locationTypes)
    }
  }

  return { active, loading, toggle, blocked }
}
