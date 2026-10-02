import { useEffect, useRef } from 'react'

import mapConfig from '@configs/map'

import { useMapLayers } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

/**
 * Keeps overlay layers and a search polygon mutually exclusive. When a drawn or
 * loaded search polygon appears, turns off any active *selectable* overlay so its
 * markers can't silently replace the polygon through a location selection —
 * closing the one path the disabled toggle buttons can't (a layer already on when
 * the polygon loads, e.g. from the URL). One-way: clearing the polygon does not
 * bring the overlays back, the user re-enables them deliberately.
 */
export const useOverlayPolygonGuard = () => {
  const { polygonPresent } = useSearch()
  const { activeLayers, toggleLayer } = useMapLayers()
  const wasPresent = useRef(false)

  useEffect(() => {
    // Act only on the rising edge — deactivate the selectable overlays that are
    // active at the moment the polygon appears.
    if (polygonPresent && !wasPresent.current) {
      mapConfig.overlays.layers.forEach((layer) => {
        if (layer.locationTypes?.length && activeLayers.has(layer.id)) {
          toggleLayer(layer.id)
        }
      })
    }
    wasPresent.current = polygonPresent
  }, [polygonPresent, activeLayers, toggleLayer])
}
