import { cache } from 'react'

import filtersConfig from '@configs/filters'
import searchConfig from '@configs/search'

import { APIListingDetails, type ApiQueryParams } from 'services/API'
import SearchService, { getListingFields } from 'services/Search'
import { parseSeoUrl } from 'utils/listings'

import { type Params, type SearchParams } from './types'

const { statusFilters } = filtersConfig

export const parseParams = (params: Params, searchParams: SearchParams) => {
  const listingName = params.listingName?.[0] || ''
  const slugs = listingName.split('-')

  // The `-{boardId}` suffix wins. Links minted outside the app — FUB events,
  // alert emails — carry the board as `?boardId=` instead, honoured only for a
  // board the tenant addresses explicitly, so a stray value reads the default
  // board instead of forking the record we fetch.
  const suffixBoardId = (slugs.at(-1) || '').match(/^\d{1,3}$/)
    ? Number(slugs.pop())
    : 0
  const queryBoardId = Number(searchParams.boardId)
  const boardId =
    suffixBoardId ||
    (searchConfig.distinctBoardIds.includes(queryBoardId)
      ? queryBoardId
      : searchConfig.defaultBoardId)

  const listingId =
    slugs.pop() ||
    searchParams.listingId ||
    searchParams.propertyId ||
    searchParams.mlsNumber ||
    searchParams.id ||
    ''

  return { listingName, listingId, boardId }
}

export const fetchListing = cache(
  async (listingId: string, boardId: number) => {
    return await APIListingDetails.fetchListing(listingId, boardId)
  }
)

export const fetchNearbies = cache(async (listingName: string) => {
  const parsedAddress = parseSeoUrl(listingName)
  const { streetName, streetSuffix, city, boardId } = parsedAddress
  const query = `${streetName} ${streetSuffix}, ${city}`
  const fetchParams: Partial<ApiQueryParams> = {
    search: query,
    searchFields: 'address.streetName,address.streetSuffix,address.city',
    boardId,
    ...statusFilters.active,
    type: 'sale',
    resultsPerPage: 4,
    class: ['condo', 'residential'],
    ...getListingFields()
  }

  try {
    const response = await SearchService.fetch(fetchParams)
    return response?.listings || []
  } catch {
    return []
  }
})
