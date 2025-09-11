import { type Marker } from 'mapbox-gl'

export interface Markers {
  [key: string]: Marker
}

export enum MapDataMode {
  SINGLE_MARKER = 'SINGLE_MARKER',
  CLUSTER = 'CLUSTER'
}

// Google Places API Types
export type GooglePlaceDetailsResponse = {
  result: {
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }
  status:
    | 'OK'
    | 'ZERO_RESULTS'
    | 'OVER_QUERY_LIMIT'
    | 'REQUEST_DENIED'
    | 'INVALID_REQUEST'
    | 'NOT_FOUND'
}
