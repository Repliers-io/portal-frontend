import { type MapStyle } from '@defaults/map'

export type Params = {
  layout: 'map' | 'grid'
  style: MapStyle
}

export type SearchParams = {
  searchId: number
  point: string
  polygon: string
  aiImage: string | string[]
  aiFeature: string | string[]
  search: string
  openHouse?: string
  source?: string
  slug?: string
}
