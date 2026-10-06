import { type MapboxAddress } from 'services/Map'

import { type ApiLocationsResponse } from './locations'
import { type ApiQueryResponse } from './search'

export type ApiAutosuggestResponse = {
  locations: ApiLocationsResponse
  listings: ApiQueryResponse
  mapbox: MapboxAddress[]
}
