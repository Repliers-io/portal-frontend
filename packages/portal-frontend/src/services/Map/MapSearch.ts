import { type FeatureCollection } from 'geojson'
import queryString from 'query-string'

import mapConfig from '@configs/map'

import { type ApiAddress, type ApiCoordsWithZip } from 'services/API'
import { APIBase } from 'services/API'
import { logError } from 'utils/log'
import { toApiPoint } from 'utils/map'
import { getSessionToken } from 'utils/tokens'

import { type MapboxAddress } from './types'

const mapboxApiUrl = 'https://api.mapbox.com/search/searchbox/v1'

const { center, country, language, limit } = mapConfig.proximitySearch

class MapSearch extends APIBase {
  async fetchMapboxSuggestion(
    query: string
  ): Promise<MapboxAddress | undefined> {
    const params = queryString.stringify({
      q: query,
      types: 'street,postcode,address',
      session_token: getSessionToken(),
      access_token: mapConfig.mapboxDefaults.accessToken,
      country,
      language,
      limit,
      proximity: `${center.lng},${center.lat}`
    })

    const { suggestions } = await this.fetchJSON<{
      suggestions: MapboxAddress[]
    }>(`${mapboxApiUrl}/suggest?${params}`)
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
      logError('Error fetching Google Place coordinates:', error)
      return
    }
  }
}

const mapSearchInstance = new MapSearch()
export default mapSearchInstance
