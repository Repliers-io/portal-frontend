import { useEffect } from 'react'
import { type Position } from 'geojson'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { removePolygon } from 'utils/map'

/**
 * Removes the search polygon (drawn ring or loaded saved-search region — they
 * share the 'user' source) from the map when both props are cleared.
 */
export const useMapPolygon = (
  polygon?: Position[] | null,
  region?: Position[][] | null
) => {
  const { mapRef } = useMapOptions()

  useEffect(() => {
    if (mapRef.current && !polygon && !region) removePolygon(mapRef.current)
  }, [polygon, region])
}
