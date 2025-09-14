import { cache } from 'react'

import searchConfig from '@configs/search'

import { APIPropertyDetails, type ApiQueryParams } from 'services/API'
import SearchService, { getListingFields } from 'services/Search'
import { parseSeoUrl } from 'utils/properties'

import { type Params, type SearchParams } from './types'

export const parseParams = (params: Params, searchParams: SearchParams) => {
  const listingName = params.listingName?.[0] || ''
  const slugs = listingName.split('-')

  const boardId = Number(
    (slugs.at(-1) || '').match(/^\d{1,3}$/)
      ? slugs.pop() || searchConfig.defaultBoardId
      : searchConfig.defaultBoardId
  )

  const listingId =
    slugs.pop() ||
    searchParams.listingId ||
    searchParams.propertyId ||
    searchParams.mlsNumber ||
    searchParams.id ||
    ''

  return { listingName, listingId, boardId }
}

export const fetchProperty = cache(
  async (listingId: string, boardId: number) => {
    return await APIPropertyDetails.fetchProperty(listingId, boardId)
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
    status: 'A',
    type: 'sale',
    resultsPerPage: 4,
    class: ['condo', 'residential'],
    ...getListingFields()
  }

  try {
    const response = await SearchService.fetch(fetchParams)
    return response?.listings || []
  } catch (error) {
    console.error('[fetchNearbies] error', fetchParams, error)
    return []
  }
})
