import { useEffect } from 'react'

import type { OverlayLayerDefinition } from '@defaults/map'

import { type ApiLocation } from 'services/API'
import { useMapLayers, useMapLocations } from 'providers/MapOptionsProvider'
import { parseExternalLocationId } from 'utils/map/externalLocations'
import { overlayEffectiveOptions } from 'utils/map/overlays'

import { useLocationSelection } from './useLocationSelection'

/**
 * Selected external locations of an ACTIVE layer whose filter token no longer
 * matches the layer's effective options. External `rest` ids end with
 * `-<filterToken>` (see OverlayExternalLocations), so drift is a suffix check.
 * Pure — unit tested.
 */
export const staleExternalSelections = (
  locations: ApiLocation[] | null,
  overlays: OverlayLayerDefinition[],
  activeLayers: Set<string>,
  layerOptions: Record<string, Record<string, boolean>>
): ApiLocation[] =>
  (locations ?? []).filter((loc) => {
    if (!loc.external) return false
    const parsed = parseExternalLocationId(loc.locationId, overlays)
    if (!parsed || !activeLayers.has(parsed.overlayId)) return false
    const overlay = overlays.find((o) => o.id === parsed.overlayId)
    if (!overlay?.external) return false
    const token = overlay.external.filterToken(
      overlayEffectiveOptions(overlay, layerOptions)
    )
    return !parsed.rest.endsWith(`-${token}`)
  })

/**
 * Enforces the reset-on-filter-change rule for external selections: while a
 * layer is active, every selected external location of that layer must carry
 * the current filter token — mismatches are dropped (same UX as hiding a
 * selectable layer, which drops its selections via useOverlayToggle). Also
 * covers activating a layer over a reloaded selection with a stale token,
 * whose markers/polygons could never paint as selected.
 */
export const useExternalSelectionReset = (
  overlays: OverlayLayerDefinition[]
): void => {
  const { activeLayers, layerOptions } = useMapLayers()
  const { locations } = useMapLocations()
  const { selectLocations } = useLocationSelection()

  useEffect(() => {
    const stale = staleExternalSelections(
      locations,
      overlays,
      activeLayers as Set<string>,
      layerOptions
    )
    if (!stale.length) return
    const staleIds = new Set(stale.map((l) => l.locationId))
    selectLocations(
      (locations ?? []).filter((l) => !staleIds.has(l.locationId))
    )
  }, [locations, overlays, activeLayers, layerOptions, selectLocations])
}
