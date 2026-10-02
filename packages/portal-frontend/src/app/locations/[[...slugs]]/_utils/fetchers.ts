import locationConfig from '@configs/location'
import { type PopularSearch } from '@defaults/location'

import { type ApiQueryParams, APISearch, transient } from 'services/API'
import { processParams } from 'services/Search/adapter'

import { parseUrlFilters } from './parsers'

export async function fetchPopularSearchItems({
  city,
  hood
}: {
  city?: string
  hood?: string
}): Promise<PopularSearch[] | null> {
  const popularSearches = locationConfig.popularSearches as
    | PopularSearch[]
    | undefined

  if (!popularSearches?.length) return null

  const results = await Promise.all(
    popularSearches.map(async (item) => {
      try {
        const {
          sortBy: _,
          pageNum: __,
          ...filters
        } = parseUrlFilters(item.filters)

        const { get: apiParams } = processParams(
          filters as Partial<ApiQueryParams>
        )

        const response = await APISearch.fetchListingsCount(
          {
            ...(city ? { city } : {}),
            ...(hood ? { neighborhood: hood } : {}),
            ...(apiParams as Partial<ApiQueryParams>)
          },
          { next: { revalidate: 3600 } }
        )

        return response?.count ? item : null
      } catch (error) {
        if (transient(error)) throw error
        return null
      }
    })
  )

  const items = results.filter((item): item is PopularSearch => item !== null)

  return items.length ? items : null
}
