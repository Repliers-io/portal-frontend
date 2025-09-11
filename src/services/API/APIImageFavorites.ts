import APIBase from './APIBase'

type ImageArray = Array<{ id: string }>

class APIImageFavorites extends APIBase {
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

const apiImageFavoritesInstance = new APIImageFavorites()
export default apiImageFavoritesInstance
