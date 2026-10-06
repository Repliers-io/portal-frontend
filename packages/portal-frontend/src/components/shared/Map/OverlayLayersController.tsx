import { useMemo } from 'react'

import mapConfig from '@configs/map'
import {
  useExternalSelectionReset,
  useOverlayLayers,
  useOverlaySelectsLocation
} from '@shared/Map/hooks'

import useBreakpoints from 'hooks/useBreakpoints'
import { toMarkerSelect } from 'utils/map/overlays'

/**
 * Runs the overlay-layers sync (`useOverlayLayers`) as a leaf that renders nothing.
 * `useOverlaySelectsLocation` injects marker-click → location selection for
 * `selectable: 'marker'` overlays; it lives here (search map, under SearchProvider)
 * rather than inside the shared hook so the PDP map never gains a useSearch dep.
 * A phone or tablet map selects every selectable overlay through its markers
 * (`toMarkerSelect`). `useExternalSelectionReset` drops external selections whose
 * filter token drifted from the active layer's options.
 */
export const OverlayLayersController = () => {
  const { mobile, tablet } = useBreakpoints()
  const touch = mobile || tablet
  const layers = useMemo(
    () =>
      touch
        ? mapConfig.overlays.layers.map(toMarkerSelect)
        : mapConfig.overlays.layers,
    [touch]
  )
  const overlays = useOverlaySelectsLocation(layers)
  useExternalSelectionReset(overlays)
  useOverlayLayers(overlays)
  return null
}
