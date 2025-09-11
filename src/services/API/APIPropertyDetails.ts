import queryString from 'query-string'

import { similarListingsRadius } from '@configs/search'

import { type ApiSimilarResponse, type Property } from 'services/API'
import { getListingFields } from 'services/Search'

import APIBase from './APIBase'

class APIPropertyDetails extends APIBase {
  fetchProperty(mls: string, boardId: number): Promise<Property> {
    const searchParams = queryString.stringify({
      boardId,
      fields: 'raw'
    })
    return this.fetchJSON(`/listings/${mls}?${searchParams}`)
  }

  fetchSimilarListings(
    mls: string,
    boardId: number
  ): Promise<ApiSimilarResponse> {
    const { fields } = getListingFields()
    const searchParams = queryString.stringify({
      fields,
      boardId,
      radius: similarListingsRadius,
      sortBy: 'createdOnDesc',
      listPriceRange: '200000'
    })

    return this.fetchJSON(`/listings/${mls}/similar?${searchParams}`)
  }
}

const apiPropertyDetailsInstance = new APIPropertyDetails()
export default apiPropertyDetailsInstance
