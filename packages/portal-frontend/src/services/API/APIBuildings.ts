import queryString from 'query-string'

import { APIBase, stringifyOptions } from './APIBase'
import {
  type ApiBuildingsQueryParams,
  type ApiBuildingsRequestBody,
  type ApiBuildingsResponse
} from './types'

class APIBuildingsClass extends APIBase {
  /**
   * Fetch buildings using GET request
   * @param params Query parameters for filtering buildings
   * @param options Additional fetch options
   */
  async fetchBuildings(
    params: ApiBuildingsQueryParams,
    options?: RequestInit
  ): Promise<ApiBuildingsResponse> {
    const query = queryString.stringify(params, stringifyOptions)

    return this.fetchJSON<ApiBuildingsResponse>(`/buildings?${query}`, {
      method: 'GET',
      ...options
    })
  }

  /**
   * Search buildings using POST request (for complex map filtering)
   * @param params Query parameters for filtering buildings
   * @param body Request body containing map polygon
   * @param options Additional fetch options
   */
  async searchBuildings(
    params: ApiBuildingsQueryParams,
    body?: ApiBuildingsRequestBody,
    options?: RequestInit
  ): Promise<ApiBuildingsResponse> {
    const query = queryString.stringify(params, stringifyOptions)

    return this.fetchJSON<ApiBuildingsResponse>(`/buildings?${query}`, {
      method: 'POST',
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...options
    })
  }

  /**
   * Unified fetch method that automatically chooses GET or POST
   * based on whether body is provided
   * @param params Query parameters for filtering buildings
   * @param body Optional request body containing map polygon
   * @param options Additional fetch options
   */
  async fetch(
    params: ApiBuildingsQueryParams,
    body?: ApiBuildingsRequestBody,
    options?: RequestInit
  ): Promise<ApiBuildingsResponse> {
    if (body && Object.keys(body).length > 0) {
      return this.searchBuildings(params, body, options)
    }
    return this.fetchBuildings(params, options)
  }
}

export const APIBuildings = new APIBuildingsClass()
