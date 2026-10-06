import queryString from 'query-string'

import {
  type ApiListingsCountResponse,
  type ApiQueryParams,
  type ApiQueryResponse
} from 'services/API'
import { getPath } from 'utils/path'

import { APIBase, stringifyOptions } from './APIBase'

// `/listings/featured/<slug>` defines its own listing set — it accepts only
// sorting and pagination; the remaining filters are dropped.
const featuredParams = ['sortBy', 'pageNum', 'resultsPerPage'] as const

class APISearchClass extends APIBase {
  fetch(params: { get?: any; post?: any }, options?: RequestInit) {
    const { source, slug, ...getParams } = params.get ?? {}

    if (source === 'featured' && slug) {
      return this.fetchFeatured(slug, getParams, options)
    }

    // GET params
    const getParamsString = queryString.stringify(getParams, stringifyOptions)
    // POST params
    const postParamsString =
      params.post && Object.keys(params.post).length
        ? JSON.stringify(params.post)
        : ''

    return this.fetchJSON<ApiQueryResponse>(
      `/listings/search?${getParamsString}`,
      {
        ...(postParamsString
          ? { method: 'POST', body: postParamsString }
          : { method: 'GET' }),
        ...options
      }
    )
  }

  fetchFeatured(
    slug: string,
    params: Partial<ApiQueryParams> = {},
    options?: RequestInit
  ) {
    const safeSlug =
      typeof slug === 'string' && /^[\w-]{1,100}$/.test(slug) ? slug : null
    if (!safeSlug) return Promise.resolve(null)

    // `skipNull` drops the keys the caller didn't set, so no pre-filtering
    const query = queryString.stringify(
      Object.fromEntries(featuredParams.map((key) => [key, params[key]])),
      stringifyOptions
    )

    return this.fetchJSON<ApiQueryResponse>(
      `/listings/featured/${safeSlug}${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        ...options
      }
    )
  }

  // Value counts per field path (`raw.View` → { lake: 1699 }) over the matching listings.
  async fetchAggregates(
    paths: readonly string[],
    params: Record<string, unknown> = {}
  ) {
    const query = queryString.stringify(
      { aggregatesUnique: paths.join(','), listings: false, ...params },
      stringifyOptions
    )
    const { aggregatesUnique } = await this.fetchJSON<{
      aggregatesUnique: Record<string, unknown>
    }>(`/listings/search?${query}`)

    return Object.fromEntries(
      paths.map((path) => [
        path,
        (getPath(aggregatesUnique, path) ?? {}) as Record<string, number>
      ])
    )
  }

  fetchListingsCount(params: Partial<ApiQueryParams>, options?: RequestInit) {
    const query = queryString.stringify(params, stringifyOptions)

    return this.fetchJSON<ApiListingsCountResponse>(
      `/listings/count?${query}`,
      {
        ...options
        // logging: { response: true }
      }
    )
  }
}

export const APISearch = new APISearchClass()
