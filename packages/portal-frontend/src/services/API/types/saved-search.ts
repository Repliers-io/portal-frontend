import { type Position } from 'geojson'

import { type ApiClass } from './common'

export type SavedSearchNotificationFrequency =
  | 'instant'
  | 'daily'
  | 'weekly'
  | 'monthly'

export interface ApiSavedSearch {
  searchId: number
  clientId: number
  name: string
  streetNumbers: string[]
  streetNames: string[]
  minBeds?: number
  maxMaintenanceFee: number
  minBaths?: number
  maxBaths?: number
  areas: string[]
  cities: string[]
  neighborhoods: string[]
  notificationFrequency: SavedSearchNotificationFrequency
  maxPrice?: number
  minPrice?: number
  minYearBuilt?: number
  maxYearBuilt?: number
  propertyTypes: string[]
  styles: string[]
  // Single Polygon rings (outer + holes); the endpoint rejects a MultiPolygon
  map: Position[][]
  status: boolean
  type: 'sale' | 'lease'
  class: ApiClass[]
  minGarageSpaces: number
  minKitchens: number
  minParkingSpaces: number
  basement: string[]
  soldNotifications: boolean
  priceChangeNotifications: boolean
  sewer: string[]
  heating: string[]
  swimmingPool: string[]
  waterSource: string[]
  minSqft?: number
  maxSqft?: number
  minLotSizeSqft?: number
  maxLotSizeSqft?: number
  minLotWidth?: number
  maxLotWidth?: number
  keywords?: string[]
}

export interface ApiSavedSearchCreateRequest {
  clientId: number
  minPrice: number
  maxPrice: number
  type: 'sale' | 'lease'
  class: ApiClass[]

  map?: Position[][]
  name?: string
  streetNumbers?: Array<string>
  streetNames?: Array<string>
  minBeds?: number
  minBaths?: number
  propertyTypes?: string[]
  styles?: string[]
  status?: boolean
  minGarageSpaces?: number
  minParkingSpaces?: number
  soldNotifications?: boolean
  notificationFrequency?: SavedSearchNotificationFrequency
  minYearBuilt?: number
  maxYearBuilt?: number
  maxMaintenanceFee?: number
  minSqft?: number
  maxSqft?: number
  minLotSizeSqft?: number
  maxLotSizeSqft?: number
  minLotWidth?: number
  maxLotWidth?: number
  keywords?: string[]
}

export interface ApiSavedSearchUpdateRequest extends ApiSavedSearchCreateRequest {
  searchId: number
}

export interface ApiSavedSearchRequest {
  page: number
  numPages: number
  pageSize: number
  count: number
  searches: ApiSavedSearch[]
}
