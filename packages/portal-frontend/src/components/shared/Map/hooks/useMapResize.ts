import { useEffect } from 'react'

import { useMapOptions } from 'providers/MapOptionsProvider'

/**
 * Keeps the Mapbox canvas correctly sized in two scenarios:
 * 1. The map container becomes visible after being off-screen (IntersectionObserver).
 * 2. The user returns to the map layout after viewing the grid.
 */
export const useMapResize = (mapVisible: boolean) => {
  const { mapRef, layout } = useMapOptions()

  useEffect(() => {
    mapRef.current?.resize()
  }, [mapVisible])

  // resize map after returning from the grid layout
  useEffect(() => {
    // TODO: add debouncing
    if (layout === 'map') setTimeout(() => mapRef.current?.resize(), 700)
  }, [layout])
}
