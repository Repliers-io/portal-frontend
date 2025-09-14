import { type FeatureCollection } from 'geojson'
import queryString from 'query-string'

import mapConfig from '@configs/map'

import {
  type ApiAddress,
  type ApiCoordsWithZip,
  type MapboxAddress,
  type MapboxSuggestResponse
} from 'services/API'
import { toApiPoint } from 'utils/map'
import { getSessionToken } from 'utils/tokens'

import APIBase from '../API/APIBase'

const mapboxApiUrl = 'https://api.mapbox.com/search/searchbox/v1'

const {
  proximitySearchCenter,
  proximitySearchCountry,
  proximitySearchLanguage,
  proximitySearchLimit
} = mapConfig

class MapSearch extends APIBase {
  async fetchMapboxSuggestion(
    query: string
  ): Promise<MapboxAddress | undefined> {
    const params = queryString.stringify({
      q: query,
      types: 'street,postcode,address',
      session_token: getSessionToken(),
      access_token: mapConfig.mapboxDefaults.accessToken,
      country: proximitySearchCountry,
      language: proximitySearchLanguage,
      limit: proximitySearchLimit,
      proximity: `${proximitySearchCenter.lng},${proximitySearchCenter.lat}`
    })

    const { suggestions } = await this.fetchJSON<MapboxSuggestResponse>(
      `${mapboxApiUrl}/suggest?${params}`
    )
    return suggestions.find((suggestion) => suggestion.name === query)
  }

  fetchMapboxAddressPoint = async ({
    mapbox_id
  }: ApiAddress | MapboxAddress): Promise<ApiCoordsWithZip | undefined> => {
    if (!mapbox_id) return

    const params = queryString.stringify({
      session_token: getSessionToken(),
      access_token: mapConfig.mapboxDefaults.accessToken
    })

    const url = `${mapboxApiUrl}/retrieve/${mapbox_id}?${params}`
    const response = await this.fetchJSON<FeatureCollection>(url)
    return toApiPoint(response.features[0].geometry as any)
  }

  fetchGmapsAddressPoint = async ({
    google_place_id
  }: ApiAddress): Promise<ApiCoordsWithZip | undefined> => {
    if (!google_place_id) return

    try {
      const params = queryString.stringify({
        id: google_place_id
      })
      // Using direct fetch to call our Next.js API route
      const response = await fetch(`/api/places?${params}`)
      return (await response.json()) as ApiCoordsWithZip
    } catch (error) {
      console.error('Error fetching Google Place coordinates:', error)
      return
    }
  }
}

const mapSearchInstance = new MapSearch()
export default mapSearchInstance
