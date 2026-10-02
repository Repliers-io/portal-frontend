import { useEffect, useRef, useState } from 'react'
import type { LngLatBounds } from 'mapbox-gl'

import {
  type ApiCluster,
  type ApiListing,
  type ApiQueryParams
} from 'services/API'
import SearchService, {
  type Filters,
  getClusterParams,
  getMapRectangle
} from 'services/Search'

export const useMapListings = (
  filters?: Partial<ApiQueryParams & Filters>,
  zoom: number = 10,
  bounds?: LngLatBounds | null,
  skip = false
) => {
  const [listings, setListings] = useState<ApiListing[]>([])
  const [clusters, setClusters] = useState<ApiCluster[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  // Track whether the first fetch has completed so subsequent refetches
  // (triggered by map pan/zoom) happen silently without showing the overlay.
  const fetchedOnce = useRef(false)

  useEffect(() => {
    if (skip) return

    const fetchListings = async () => {
      try {
        setFetching(true)
        if (!fetchedOnce.current) setLoading(true)
        const response = await SearchService.fetchListings(
          {
            ...filters,
            ...getClusterParams(zoom),
            // A radius search is a fixed geo-area — keep it as the hard filter and
            // don't clip it to the moving viewport, or panning would change results.
            ...(bounds && !filters?.radius ? getMapRectangle(bounds) : {})
          },
          // independent: widgets must not share the global AbortController,
          // otherwise multiple maps (or a map + carousel) cancel each other.
          true
        )
        if (response) {
          setListings(response.listings)
          setClusters(response.aggregates?.map.clusters ?? [])
          setCount(response.count)
        }
      } catch (error) {
        console.error('MapWidget::Error fetching listings', error)
      } finally {
        fetchedOnce.current = true
        setLoading(false)
        setFetching(false)
      }
    }

    fetchListings()
  }, [bounds, skip, zoom])

  return { listings, clusters, count, loading, fetching }
}
