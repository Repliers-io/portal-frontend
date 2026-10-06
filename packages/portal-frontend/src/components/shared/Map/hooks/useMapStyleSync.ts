import { useEffect } from 'react'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { getMapStyleUrl } from 'utils/map'

/**
 * Syncs the Mapbox style when the user switches between map / hybrid / satellite.
 * Each renderer (overlays, the selection polygons) re-draws itself on `style.load`.
 */
export const useMapStyleSync = () => {
  const { mapRef, style } = useMapOptions()

  useEffect(() => {
    mapRef.current?.setStyle(getMapStyleUrl(style))
  }, [style])
}
