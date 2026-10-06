import { useMapOptions, useMapPopupActions } from 'providers/MapOptionsProvider'

import { useMapListener } from '../useMapListener'

/**
 * Close a tap-opened marker preview when the user taps empty map space — touch
 * fires no mouseleave, so without this the tooltip and its catchment would stay
 * until another marker is tapped. The marker stops the event before it reaches
 * the map (see `wireLeaf`), so this only fires off-marker.
 *
 * Scoped to the tap preview on purpose: hover tooltips close themselves on
 * mouseleave, and clearing the polygon one here would keep it hidden until the
 * cursor left its feature and came back (its own `hoveredLocationId` still
 * points at the polygon under the cursor).
 */
export const useOverlayPopupDismiss = () => {
  const { mapRef } = useMapOptions()
  const { closeOverlayMarkerRef } = useMapPopupActions()

  useMapListener(mapRef, (map) => {
    map.on('click', () => closeOverlayMarkerRef.current?.())
  })
}
