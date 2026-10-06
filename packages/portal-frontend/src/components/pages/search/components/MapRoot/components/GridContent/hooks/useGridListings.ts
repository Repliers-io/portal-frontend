import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { Position } from 'geojson'

import { type ApiListing } from 'services/API'
import {
  type Filters,
  getListingFields,
  getPageParams,
  getSearchArea,
  unresolvedExternalIds
} from 'services/Search'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { sliceListingsPerPage, toServerPage } from 'utils/pagination'

interface UseGridListingsParams {
  serverPage: number
  clientPage: number
  paramsPage: number
  currentServerPage: RefObject<number>
  scrollToTop: () => void
}

export const useGridListings = ({
  serverPage,
  clientPage,
  paramsPage,
  currentServerPage,
  scrollToTop
}: UseGridListingsParams) => {
  const {
    search,
    filters,
    polygon,
    region,
    point,
    listings,
    multiUnits,
    page
  } = useSearch()
  const { position, layout } = useMapOptions()
  const { locations } = useMapLocations()

  // When GridContent's page-N fetch fires concurrently with MapPageContent's page-1 search,
  // SearchService's global AbortController cancels one of them. Track aborted state to retry.
  const fetchAborted = useRef(false)

  // On deep-link load (page > 1), stay in loading state until grid's own fetch completes.
  // Prevents EmptyState flash when map fetch commits via save() before grid fetch starts.
  const [gridReady, setGridReady] = useState(toServerPage(paramsPage) === 1)
  const [serverListings, setServerListings] = useState<ApiListing[]>([])
  const [clientListings, setClientListings] = useState<ApiListing[]>([])

  const fetchListings = async (
    searchFilters: Filters,
    drawPolygon: Position[] | null
  ) => {
    fetchAborted.current = false
    const { bounds } = position

    // Shared region resolver (MOV-191): location-polygon extraction, boundary
    // clip and external-selection queries stay in lockstep with the map search.
    const { filters, area } = getSearchArea(searchFilters, {
      polygon: drawPolygon ?? region,
      point,
      bounds,
      locations
    })

    const response = await search(
      {
        ...filters,
        ...getListingFields(),
        ...getPageParams(serverPage),
        ...area
      },
      true // clear loading after fetch — grid fetches never call save()
    )

    if (!response) {
      // SearchService aborted this request (superseded by a concurrent map search).
      // The [listings, page] effect will retry once the map search completes.
      fetchAborted.current = true
      return
    }

    const { listings } = response

    setServerListings(listings)
    setClientListings(sliceListingsPerPage(listings, clientPage))
    setGridReady(true)
    scrollToTop()
  }

  useEffect(() => {
    // Skip cache update if page is 0 (special loading state)
    if (page === 0) return

    if (serverPage === 1) {
      setServerListings(multiUnits.length ? multiUnits : listings)
      setClientListings(sliceListingsPerPage(listings, clientPage))
      scrollToTop()
    } else if (fetchAborted.current) {
      // Grid's page-N fetch was aborted by a concurrent map search (shared AbortController).
      // Map search has now completed — retry the grid fetch.
      fetchListings(filters, polygon)
    }
  }, [listings, page])

  useEffect(() => {
    if (serverPage !== currentServerPage.current) {
      // WARN: abort fetching if the map is not initialized yet
      if (layout === 'map' && !position.bounds) return
      // Selected external locations still resolving their geometry — fetching
      // now would drop their constraint. Retried when `locations` updates.
      if (unresolvedExternalIds(filters, locations).length) return
      currentServerPage.current = serverPage
      fetchListings(filters, polygon)
    }
  }, [serverPage, layout, position.bounds, locations])

  useEffect(() => scrollToTop(), [multiUnits.length])

  const sliceToPage = useCallback(
    (newPage: number) => {
      setClientListings(sliceListingsPerPage(serverListings, newPage))
    },
    [serverListings]
  )

  return { serverListings, clientListings, gridReady, sliceToPage }
}
