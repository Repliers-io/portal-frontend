import { useState } from 'react'
import type { LngLatBounds } from 'mapbox-gl'

import mapConfig from '@configs/map'

import { type ApiLocation, APILocations } from 'services/API'
import { useMapOptions } from 'providers/MapOptionsProvider'
import {
  calcBoundsAtZoom,
  calcZoomLevel,
  fitBounds,
  getLngLatCenter,
  getLocationExtent
} from 'utils/map'

interface UseLocationClickOptions {
  locations: ApiLocation[]
}

const { zoom } = mapConfig

// Clicking a chip only recenters the map on the location — the selection is
// never mutated here (removal is handled by the chip's own X).
export const useLocationClick = ({ locations }: UseLocationClickOptions) => {
  const { mapRef, setCenterEnabled } = useMapOptions()
  const [loading, setLoading] = useState(false)

  const handleClick = async (clicked: ApiLocation) => {
    setLoading(true)

    let bounds: LngLatBounds | null = null
    try {
      // Disable recenter button immediately
      setCenterEnabled(false)

      // 1. Try to find in existing locations array
      const foundLocation = locations.find(
        (loc) => loc.type === clicked.type && loc.name === clicked.name
      )

      const localExtent = foundLocation
        ? getLocationExtent(foundLocation)
        : null
      if (localExtent) {
        // Already have an extent (bounds or boundary) — use it, no fetch
        bounds = localExtent
      } else {
        // 2. Point-only (no local boundary/bounds) — the shared helper resolves
        // bounds by the location's own id (the same id the listings filter by),
        // so the map lands where the results are.
        bounds = await APILocations.fetchLocationBounds(clicked)
      }

      const map = mapRef.current
      if (bounds && map) {
        const locationZoom = calcZoomLevel(map, bounds)
        if (locationZoom > zoom.address) {
          // object's bounds are too small, use address zoom level
          const center = getLngLatCenter(bounds)
          bounds = calcBoundsAtZoom(map, center, zoom.address)
        }

        fitBounds(map, bounds)
        // Wait for map movement to complete, then enable recenter button
        await new Promise<void>((resolve) => {
          map.once('moveend', () => {
            setCenterEnabled(true)
            resolve()
          })
        })
      }
    } catch {
      // Recenter failed (e.g. bounds lookup) — leave the map as-is.
    } finally {
      setLoading(false)
      setCenterEnabled(true)
    }
  }

  return { handleClick, loading }
}
