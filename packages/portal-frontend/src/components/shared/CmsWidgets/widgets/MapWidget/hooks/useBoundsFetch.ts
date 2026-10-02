import { useEffect, useState } from 'react'
import { LngLatBounds } from 'mapbox-gl'

import { type ApiQueryParams } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import { getDefaultBounds } from 'utils/map'

// Coarse zoom used exclusively for the dry bounds-discovery fetch.
// A low zoom yields very broad clusters which is enough to compute
// the bounding box; the actual rendering zoom is applied later in onLoad.
const BOUNDS_ZOOM = 3

export const useBoundsFetch = (
  filters?: Partial<ApiQueryParams & Filters>,
  enabled = true
) => {
  const [bounds, setBounds] = useState<LngLatBounds | null>(null)
  const [ready, setReady] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return

    const fetchBounds = async () => {
      try {
        const response = await SearchService.fetchBounds(
          BOUNDS_ZOOM,
          filters,
          true
        )

        if (response) {
          const b = new LngLatBounds()

          ;(response.aggregates?.map.clusters ?? []).forEach(
            ({ bounds: { top_left, bottom_right } }) => {
              b.extend([top_left.longitude, top_left.latitude])
              b.extend([bottom_right.longitude, bottom_right.latitude])
            }
          )

          if (!b.isEmpty()) {
            // Cluster bounds are geohash cell boundaries — actual listing
            // coordinates (returned by /listings) can sit slightly outside them
            // due to backend precision differences. Add a small geographic
            // buffer so boundary listings are never clipped.
            const sw = b.getSouthWest()
            const ne = b.getNorthEast()
            const latBuffer = Math.max((ne.lat - sw.lat) * 0.1, 0.005)
            const lngBuffer = Math.max((ne.lng - sw.lng) * 0.1, 0.005)
            b.extend([sw.lng - lngBuffer, sw.lat - latBuffer])
            b.extend([ne.lng + lngBuffer, ne.lat + latBuffer])
          }

          // When bounds are empty (0 results), fall back to the tenant's default
          // area so the map still initializes to a meaningful location.
          setBounds(b.isEmpty() ? getDefaultBounds() : b)
        }
      } catch {
        // Bounds fetch failing is non-fatal — map will init without fitBounds.
      } finally {
        setReady(true)
      }
    }

    fetchBounds()
    // Intentionally omits `filters` — widget filters are static after mount.
  }, [enabled])

  return { bounds, ready }
}
