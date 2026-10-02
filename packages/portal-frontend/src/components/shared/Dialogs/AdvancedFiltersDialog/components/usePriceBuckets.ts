import { useEffect, useEffectEvent, useState } from 'react'

import { fetchPriceBuckets, useSearchArea } from '@shared/Filters/priceBuckets'

import SearchService, { type Filters, getSearchArea } from 'services/Search'
import { useSearch } from 'providers/SearchProvider'
import useDebounce from 'hooks/useDebounce'

export const usePriceBuckets = (dialogState: Filters) => {
  const { filters } = useSearch()
  const searchArea = useSearchArea()

  // Debounce the whole dialog state, not just `search`: every filter
  // (sqft, lot size, year, etc.) drives the count/buckets preview, so each
  // keystroke must wait for a typing pause before firing a request.
  const debouncedState = useDebounce(dialogState, 300)
  const previewFilters = { ...filters, ...debouncedState }
  const {
    minPrice: _minPrice,
    maxPrice: _maxPrice,
    ...noPriceFilters
  } = debouncedState
  // Refetch keys: the buckets ignore the price range they are there to pick.
  const countKey = JSON.stringify(debouncedState)
  const bucketsKey = JSON.stringify(noPriceFilters)

  const [count, setCount] = useState<number | null>(null)
  const [buckets, setBuckets] = useState({})

  const fetchCounts = useEffectEvent(async () => {
    if (!searchArea.bounds) return
    // The region the results search resolves, so the preview matches the
    // results counter (MOV-191).
    const { filters: areaFilters, area } = getSearchArea(
      previewFilters,
      searchArea
    )
    try {
      const response = await SearchService.fetch(
        { ...areaFilters, ...area },
        true
      )
      if (response) setCount(response.count)
    } catch {
      // request was aborted or disabled — ignore silently
    }
  })

  const fetchBuckets = useEffectEvent(async () => {
    if (!searchArea.bounds) return
    try {
      const priceBuckets = await fetchPriceBuckets(previewFilters, searchArea)
      if (priceBuckets) setBuckets(priceBuckets)
    } catch {
      // request was aborted or disabled — ignore silently
    }
  })

  useEffect(() => {
    fetchBuckets()
  }, [bucketsKey])

  useEffect(() => {
    fetchCounts()
  }, [countKey])

  return { count, buckets }
}
