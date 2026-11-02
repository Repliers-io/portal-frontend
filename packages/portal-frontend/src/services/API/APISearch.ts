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

type SearchParams = { get?: any; post?: any }

class APISearchClass extends APIBase {
  fetch(params: SearchParams, options?: RequestInit) {
    const { source, slug, ...get } = params.get ?? {}

    if (source === 'featured' && slug) {
      return this.fetchFeatured(slug, get, options)
    }

    return this.search('/listings/search', { ...params, get }, options)
  }

  // Aggregates-only twin of `/listings/search` (`listings` pinned to false),
  // cached server-side per distinct set of parameters.
  fetchGraph(params: SearchParams, options?: RequestInit) {
    return this.search('/stats/graph', params, options)
  }

  // Filters go in the query; a non-empty `post` (map, queries, image search)
  // turns the request into a POST with it as the body.
  private search(
    path: string,
    { get, post }: SearchParams,
    options?: RequestInit
  ) {
    const body = post && Object.keys(post).length ? JSON.stringify(post) : ''

    return this.fetchJSON<ApiQueryResponse>(
      `${path}?${queryString.stringify(get ?? {}, stringifyOptions)}`,
      {
        ...(body ? { method: 'POST', body } : { method: 'GET' }),
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
