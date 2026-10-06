/**
 * Types for Locations API V2
 */

export type LocationType = 'city' | 'area' | 'neighborhood'

export interface LocationV2 {
  locationId: string
  name: string
  type: LocationType
  map?: {
    latitude?: string
    longitude?: string
    point?: string
    boundary?: [number, number][][]
  }
  address?: {
    city?: string
    state?: string
    country?: string
    area?: string
    neighborhood?: string
  }
}

export interface LocationsV2ApiRequest {
  radius?: number
  lat?: number
  long?: number
  state?: string
  types?: LocationType[]
  fields?: string[]
  resultsPerPage?: number
}

export interface LocationsV2ApiResponse {
  locations: LocationV2[]
  page: number
  numPages: number
  pageSize: number
  count: number
}
