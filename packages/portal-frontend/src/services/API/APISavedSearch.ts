import he from 'he'

import {
  type ApiSavedSearch,
  type ApiSavedSearchCreateRequest,
  type ApiSavedSearchRequest,
  type ApiSavedSearchUpdateRequest
} from 'services/API'

import { APIBase } from './APIBase'

// The legacy /searches/ endpoint uses different field names than our internal model.
// fieldMap: internalName -> wireName
const fieldMap: Record<string, string> = {}

const reverseMap = Object.fromEntries(
  Object.entries(fieldMap).map(([internal, wire]) => [wire, internal])
)

const remap = <T>(obj: unknown, map: Record<string, string>): T => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[map[key] ?? key] = value
  }
  return result as unknown as T
}

// The endpoint returns HTML-escaped names (e.g. `&lt;` for a typed `<`). Decode
// once here so every consumer renders the real title as plain text — React still
// escapes it on output, so this stays XSS-safe without any HTML rendering.
const fromWire = (obj: unknown): ApiSavedSearch => {
  const search = remap<ApiSavedSearch>(obj, reverseMap)
  return { ...search, name: he.decode(search.name) }
}

class APISavedSearchClass extends APIBase {
  async fetchList(): Promise<ApiSavedSearchRequest> {
    const res = await this.fetchJSON<ApiSavedSearchRequest>('/searches/')
    return {
      ...res,
      searches: res.searches.map(fromWire)
    }
  }

  // [C]RUD
  async create(params: ApiSavedSearchCreateRequest): Promise<ApiSavedSearch> {
    const res = await this.fetchJSON<Record<string, unknown>>('/searches/', {
      method: 'POST',
      body: JSON.stringify(remap(params, fieldMap))
    })
    return fromWire(res)
  }

  // C[R]UD
  async fetch(searchId: number): Promise<ApiSavedSearch> {
    const res = await this.fetchJSON<Record<string, unknown>>(
      `/searches/${searchId}`
    )
    return fromWire(res)
  }

  // CR[U]D
  async update(params: ApiSavedSearchUpdateRequest): Promise<ApiSavedSearch> {
    const res = await this.fetchJSON<Record<string, unknown>>(
      `/searches/${params.searchId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(remap(params, fieldMap))
      }
    )
    return fromWire(res)
  }

  // CRU[D]
  delete(savedSearchId: number) {
    return this.fetchRaw(`/searches/${savedSearchId}`, {
      method: 'DELETE'
    })
  }
}

export const APISavedSearch = new APISavedSearchClass()
