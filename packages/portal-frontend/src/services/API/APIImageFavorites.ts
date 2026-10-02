import { APIBase } from './APIBase'

type ImageArray = Array<{ id: string }>

class APIImageFavoritesClass extends APIBase {
  fetch() {
    return this.fetchJSON<ImageArray>('/user/assets/image-favorites')
  }

  addImage(id: string) {
    return this.fetchJSON<{ result: boolean }>('/user/assets/image-favorites', {
      method: 'POST',
      body: JSON.stringify({ id })
    })
  }

  deleteImage(id: string) {
    return this.fetchJSON<{ result: number }>(
      '/user/assets/image-favorites/remove',
      {
        method: 'POST',
        body: JSON.stringify({ id })
      }
    )
  }
}

export const APIImageFavorites = new APIImageFavoritesClass()
