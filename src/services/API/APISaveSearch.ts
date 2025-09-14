import { type PropertyClass } from '@configs/filters'

import {
  type ApiSavedSearch,
  type ApiSavedSearchCreateRequest,
  type ApiSavedSearchRequest,
  type ApiSavedSearchUpdateRequest,
  type SavedSearchNotificationFrequency
} from 'services/API'

import APIBase from './APIBase'

export interface AddSavedSearchParams {
  minPrice: number
  maxPrice: number
  minBeds?: number
  minBaths?: number
  minGarageSpaces?: number
  minParkingSpaces?: number
  class?: PropertyClass[]
  propertyTypes?: string[]
}

export interface UpdateSavedSearchParams extends AddSavedSearchParams {
  name: string
  searchId: number
  notificationFrequency: SavedSearchNotificationFrequency
}

class APISavedSearch extends APIBase {
  fetchList(): Promise<ApiSavedSearchRequest> {
    return this.fetchJSON('/searches/')
  }

  // [C]RUD
  create(params: ApiSavedSearchCreateRequest): Promise<ApiSavedSearch> {
    return this.fetchJSON('/searches/', {
      method: 'POST',
      body: JSON.stringify({
        ...params
      })
    })
  }

  // C[R]UD
  fetch(searchId: number): Promise<ApiSavedSearch> {
    return this.fetchJSON(`/searches/${searchId}`)
  }

  // CR[U]D
  update(params: ApiSavedSearchUpdateRequest): Promise<ApiSavedSearch> {
    return this.fetchJSON(`/searches/${params.searchId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...params
      })
    })
  }

  // CRU[D]
  delete(savedSearchId: number) {
    return this.fetchRaw(`/searches/${savedSearchId}`, {
      method: 'DELETE'
    })
  }
}

const apiSavedSearchInstance = new APISavedSearch()
export default apiSavedSearchInstance
