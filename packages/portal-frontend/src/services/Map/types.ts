// Mapbox types
export interface MapboxAddress {
  name: string
  mapbox_id: string
  feature_type: string
  region: {
    region_code: string
  }
  postcode: {
    name: string
  }
  place: {
    name: string
  }
  neighborhood: {
    name: string
  }
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
