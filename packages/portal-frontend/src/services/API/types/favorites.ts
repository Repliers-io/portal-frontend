import { type ApiListing } from './listings'

export interface ApiFavoritesRequest {
  page: number
  numPages: number
  pageSize: number
  count: number
  favorites: ApiListing[]
}

export interface ApiAddToFavoritesRequest {
  favoriteId: string
}
