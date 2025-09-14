import queryString from 'query-string'

import searchConfig from '@configs/search'

import {
  type ApiLocations,
  type ApiQueryParams,
  type ApiQueryResponse,
  type MapboxAddress,
  type MapboxAutosuggestions
} from 'services/API'
import { getSessionToken } from 'utils/tokens'

import APIBase from './APIBase'

class APISearch extends APIBase {
  fetch(params: { get?: any; post?: any }, options?: RequestInit) {
    // GET params
    const getParamsString = queryString.stringify(params.get, {
      arrayFormat: 'none',
      skipEmptyString: true,
      skipNull: true
    })
    // POST params
    const postParamsString =
      params.post && Object.keys(params.post).length
        ? JSON.stringify(params.post)
        : ''

    // change query method to POST if postParams are present
    return this.fetchJSON<ApiQueryResponse>(
      `/listings/search?${getParamsString}`,
      {
        ...(postParamsString
          ? {
              method: 'POST',
              body: postParamsString
            }
          : {
              method: 'GET'
            }),
        ...options
      }
    )
  }

  // TODO: should be part of SearchService
  fetchClusterWithBBox(
    params: Partial<ApiQueryParams>,
    options?: RequestInit
  ): Promise<ApiQueryResponse> {
    const searchParams = new URLSearchParams({
      ...params,
      listings: false,
      aggregates: 'map',
      clusterPrecision: 1,
      boardId: searchConfig.defaultBoardId,
      searchFields: 'address.city,address.neighborhood'
    } as any)
    // TODO: fix type of params mutation

    return this.fetchJSON<ApiQueryResponse>(
      `/listings/search?${searchParams}`,
      options
    )
  }

  async fetchLocations(options?: any) {
    try {
      return await this.fetchJSON<ApiLocations>(
        '/autosuggest/locations',
        options
      )
    } catch (error) {
      console.error('[Locations] error fetching data', error)
      return null
    }
  }

  async fetchAutosuggestions(q: string) {
    const params = queryString.stringify({
      mapboxSearchSession: getSessionToken(),
      q
    })

    const response = await this.fetchJSON<MapboxAutosuggestions>(
      `/autosuggest?${params}`
    )

    const {
      mapbox,
      listings: { count, listings }
    } = response

    return {
      address: (Array.from(mapbox) as MapboxAddress[]) || [],
      listings,
      count
    }
  }
}

const apiSearchInstance = new APISearch()
export default apiSearchInstance
