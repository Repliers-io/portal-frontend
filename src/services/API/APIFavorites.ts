import {
  type ApiAddToFavoritesRequest,
  type ApiFavoritesRequest
} from 'services/API'

import APIBase from './APIBase'

class APIFavorites extends APIBase {
  fetch(): Promise<ApiFavoritesRequest> {
    return this.fetchJSON('/favorites/')
  }

  delete(favoriteId: string) {
    return this.fetchRaw(`/favorites/${favoriteId}`, {
      method: 'DELETE'
    })
  }

  // We have multiple boards available in the App and we shall be able to add listings from all of them to favorites.
  add(mlsNumber: string, boardId: number): Promise<ApiAddToFavoritesRequest> {
    return this.fetchJSON('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ mlsNumber, boardId })
    })
  }
}

const apiFavoritesInstance = new APIFavorites()
export default apiFavoritesInstance
