'use client'

import SearchService, { type Filters, getSearchArea } from 'services/Search'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { leaseSearch, mergeBuckets, priceAggregateParams } from 'utils/filters'

type SearchArea = Parameters<typeof getSearchArea>[1]

/** The region the results search runs over (see MapPageContent). */
export const useSearchArea = (): SearchArea => {
  const { position } = useMapOptions()
  const { locations } = useMapLocations()
  const { polygon, region, point } = useSearch()

  return {
    polygon: polygon ?? region,
    point,
    bounds: position.bounds,
    locations
  }
}

/**
 * The histogram behind every price picker (the filter-bar chip, the advanced
 * dialog): over the region resolved exactly as the results search resolves it —
 * boundary clip, selected locations, point radius (MOV-191) — with the prices
 * cleared so every bucket shows, on the sale or lease side the filters ask for.
 */
export const fetchPriceBuckets = async (filters: Filters, area: SearchArea) => {
  const { filters: areaFilters, area: areaParams } = getSearchArea(
    filters,
    area
  )
  const response = await SearchService.fetch(
    {
      ...areaFilters,
      ...areaParams,
      ...priceAggregateParams,
      minPrice: 0,
      maxPrice: 0
    },
    true
  )

  const listPrice = response?.aggregates?.listPrice
  if (!listPrice) return null

  const rent = leaseSearch(filters)
  return mergeBuckets(
    rent ? listPrice.lease : listPrice.sale,
    rent ? 'rent' : 'sale'
  )
}
