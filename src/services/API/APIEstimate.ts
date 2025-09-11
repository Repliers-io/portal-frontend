import queryString from 'query-string'

import type { EstimateData } from '@configs/estimate'

import {
  type ApiAddress,
  type ApiEstimateParams,
  type ApiQueryParams,
  type ApiQueryResponse
} from 'services/API'
import { getListingFields } from 'services/Search'
import { processParams } from 'services/Search/adapter'
import { getSessionToken } from 'utils/tokens'

import APIBase from './APIBase'

class APIEstimate extends APIBase {
  fetchAutosuggestions(q: string): Promise<ApiAddress[]> {
    const params = queryString.stringify({
      mapboxSearchSession: getSessionToken(),
      q
    })
    return this.fetchJSON(`/autosuggest/address?${params}`)
  }

  async fetchPropertyDetails(params: {
    city: string
    streetName: string
    streetNumber: string
    streetSuffix?: string
    streetDirection?: string
    unitNumber?: string
  }) {
    const query = queryString.stringify(params, {
      skipNull: true,
      skipEmptyString: true
    })
    const endpoint = `/estimate/property_details?${query}`

    try {
      const data = await this.fetchJSON<EstimateData>(endpoint)
      return data || null
    } catch (error) {
      console.error('No address data', error)
      return null
    }
  }

  postEstimate(
    estimate: ApiEstimateParams,
    estimateId?: number
  ): Promise<EstimateData> {
    return this.fetchJSON(`/estimate/${estimateId || ''}`, {
      method: estimateId ? 'PATCH' : 'POST',
      body: JSON.stringify(estimate)
    })
  }

  postAgentEstimate(
    estimate: ApiEstimateParams,
    clientId: number,
    estimateId?: number,
    signature?: string
  ): Promise<EstimateData> {
    const endpoint = `/agent/estimate/${estimateId || clientId}${signature ? `?s=${signature}` : ''}`

    return this.fetchJSON(endpoint, {
      method: estimateId ? 'PATCH' : 'POST',
      body: JSON.stringify(estimate)
    })
  }

  fetchEstimate(id: number | string, ulid = false): Promise<EstimateData> {
    const endpoint = `/estimate/?${(ulid ? 'ulid' : 'estimateId') + `=${id}`}`
    return this.fetchJSON(endpoint)
  }

  async fetchComparables(queryParams: Partial<ApiQueryParams>) {
    const params = queryString.stringify({
      ...processParams({
        ...queryParams,
        ...getListingFields()
      }).get
    })
    const { listings } = await this.fetchJSON<ApiQueryResponse>(
      `/listings/search?${params}`
    )
    return listings
  }
}

const apiEstimateInstance = new APIEstimate()
export default apiEstimateInstance
