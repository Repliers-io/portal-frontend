import { type Position } from 'geojson'

import { type ApiClass, type YesNo } from './common'

export type ApiBuildingsType = 'sale' | 'lease'

export type ApiBuildingsSortBy = 'numUnitsDesc'

export interface ApiBuildingsMap {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface ApiBuildingsQueryParams {
  pageNum?: number
  resultsPerPage?: number
  city?: string | string[]
  neighborhood?: string | string[]
  buildingName?: string | string[]
  streetName?: string | string[]
  streetNumber?: string | string[]
  class?: ApiClass | ApiClass[]
  propertyType?: string | string[]
  type?: ApiBuildingsType
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBaths?: number
  minStories?: number
  maxStories?: number
  sortBy?: ApiBuildingsSortBy
  displayPublic?: YesNo
  radius?: number
  lat?: string
  long?: string
  map?: string
}

export interface ApiBuildingsRequestBody {
  map?: ApiBuildingsMap
}

export interface ApiBuildingAddress {
  addressKey?: string
  area?: string
  city?: string
  country?: string
  district?: string | null
  majorIntersection?: string | null
  neighborhood?: string
  state?: string
  streetDirection?: string | null
  streetName?: string
  streetNumber?: string
  streetSuffix?: string | null
  zip?: string
}

export interface ApiBuildingNearby {
  amenities?: string[]
}

export interface ApiBuildingDetails {
  buildingName?: string
  yearBuilt?: string
  minSqft?: number
  maxSqft?: number
}

export interface ApiBuildingMap {
  latitude?: string
  longitude?: string
  point?: string
}

export interface ApiBuilding {
  id: number
  name?: string
  buildingName?: string
  slug?: string
  condominium?: {
    stories?: number
    amenities?: string[]
  }
  address?: ApiBuildingAddress
  nearby?: ApiBuildingNearby
  details?: ApiBuildingDetails
  map?: ApiBuildingMap
  image?: string
  class?: string
  stories?: number
  propertyType?: string
  type?: ApiBuildingsType
  count?: number
  lat?: string
  long?: string
}

export interface ApiBuildingsResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  buildings: ApiBuilding[]
}
