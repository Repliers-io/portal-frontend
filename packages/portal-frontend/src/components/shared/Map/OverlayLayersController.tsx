import mapConfig from '@configs/map'
import {
  useExternalSelectionReset,
  useOverlayLayers,
  useOverlaySelectsLocation
} from '@shared/Map/hooks'

/**
 * Runs the overlay-layers sync (`useOverlayLayers`) as a leaf that renders nothing.
 * `useOverlaySelectsLocation` injects marker-click → location selection for
 * `selectable: 'marker'` overlays; it lives here (search map, under SearchProvider)
 * rather than inside the shared hook so the PDP map never gains a useSearch dep.
 * `useExternalSelectionReset` drops external selections whose filter token
 * drifted from the active layer's options.
 */
export const OverlayLayersController = () => {
  const overlays = useOverlaySelectsLocation(mapConfig.overlays.layers)
  useExternalSelectionReset(overlays)
  useOverlayLayers(overlays)
  return null
}
