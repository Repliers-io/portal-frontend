import queryString from 'query-string'

import { type ApiListing, type PropertyGeometryResponse } from 'services/API'

import { APIBase } from './APIBase'

class APIPropertyGeometryClass extends APIBase {
  async fetchGeometry(
    listings: ApiListing[]
  ): Promise<PropertyGeometryResponse> {
    const listingIds = listings.map((listing) => listing.mlsNumber)

    const params = queryString.stringify(
      { listingIds },
      { arrayFormat: 'none' }
    )
    const nextApiUrl = `${window.location.origin}/api/geometry?${params}`

    return this.fetchJSON(nextApiUrl)
  }
}

export const APIPropertyGeometry = new APIPropertyGeometryClass()
