import type queryString from 'query-string'

import apiConfig from '@configs/api'

import { clearToken, expired, getToken } from 'utils/tokens'
import { getForwardedFrom } from 'utils/xff'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    // Serialized payload in the message: console depth limits collapse nested
    // fields (data.info[0] prints as [Object]) — the string form keeps the full
    // upstream error visible in every log.
    super(
      `API error: ${status}${data ? `\n${JSON.stringify(data, null, 2)}` : ''}`
    )
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const stringifyOptions: queryString.StringifyOptions = {
  arrayFormat: 'none',
  skipEmptyString: true,
  skipNull: true
}

const { apiUrl, apiRequestTimeout, apiRequestRetries, apiRetryBackoff } =
  apiConfig

// Gateway 5xx, rate limits, and the synthetic 503 fetchRaw returns for aborted or
// network-failed requests. Every one of them is a blip the next attempt usually
// clears, and the data behind them is required (map geometry, counts, sitemap
// pages) — never optional — so server-side requests retry before giving up.
const transientStatuses = new Set([408, 425, 429, 500, 502, 503, 504, 522, 524])
const serverSide = typeof window === 'undefined'

// Swallowing one of these renders a page with no data, and Next caches that for
// the whole revalidate window. Rethrowing instead fails the render, so no cache
// entry is written and the previous one keeps serving.
export const transient = (error: unknown) =>
  error instanceof ApiError && transientStatuses.has(error.status)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class APIBase {
  getAbsoluteUrl(url: string) {
    return url.startsWith('http') ? url : apiUrl + url
  }

  async getHeaders() {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Accept-Encoding', 'gzip, deflate, br')

    const forwarded = await getForwardedFrom()
    if (forwarded) {
      // Empty-valued headers are worse than absent ones: an empty
      // X-Forwarded-For shifts the backend's chain offset by one, and an empty
      // token matches neither the SSR nor the SSG secret.
      if (forwarded.xff) headers.append('X-Forwarded-For', forwarded.xff)
      if (forwarded.token) {
        headers.append('X-Forwarded-For-Token', forwarded.token)
      }
      headers.append('X-Forwarded-From', forwarded.from)
    }

    const token = await getToken()
    if (token && !expired(token)) {
      headers.append('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  async fetchRaw(request: string, options?: RequestInit): Promise<Response> {
    const headers = await this.getHeaders()

    try {
      const response = await fetch(this.getAbsoluteUrl(request), {
        ...options,
        headers
      })
      if (response.status === 401) {
        clearToken()
      }
      return response
    } catch {
      // Network error (no connection, DNS failure, abort)
      return new Response(null, { status: 503 })
    }
  }

  private async fetchWithTimeout(request: string, options?: RequestInit) {
    // there are few queries that has custom abort signal
    if (options?.signal) return this.fetchRaw(request, options)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), apiRequestTimeout)

    return this.fetchRaw(request, {
      ...options,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))
  }

  async fetchJSON<T>(request: string, options?: RequestInit): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      const response = await this.fetchWithTimeout(request, options)

      // Always parse the JSON response
      let data: unknown = null
      try {
        data = await response.json()
      } catch {
        // TODO: handle error
      }

      if (response.ok) return data as T

      const retryable =
        serverSide &&
        attempt < apiRequestRetries &&
        transientStatuses.has(response.status)

      if (!retryable) return Promise.reject(new ApiError(response.status, data))

      await delay(attempt * apiRetryBackoff)
    }
  }
}
