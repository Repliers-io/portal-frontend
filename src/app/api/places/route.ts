import { type NextRequest, NextResponse } from 'next/server'
import queryString from 'query-string'

import apiConfig from '@configs/api'

import { type ApiCoords } from 'services/API'
import { type GooglePlaceDetailsResponse } from 'services/Map'

const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || ''
const { gmapsApiUrl: api, googlePlacesApiKey: key } = apiConfig

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer')
  const allowedOrigins = [appDomain]
  const validReferer = allowedOrigins.some((origin) =>
    referer?.startsWith(origin)
  )

  if (!validReferer)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('id')

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 })
  }

  try {
    const params = queryString.stringify({
      place_id: placeId,
      fields: 'geometry,address_components',
      key
    })

    const url = `${api}place/details/json?${params}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlaceDetailsResponse = await response.json()

    if (data.status === 'OK' && data.result?.geometry?.location) {
      const { lat, lng } = data.result.geometry.location

      /**
       * Extract zip code from address_components array if available
       *
       * WARN: Google's autocomplete/autosuggest API responses do not include zip codes
       * in the address structure, so we need to make an additional Google Places
       * Details API call to retrieve the full address_components array and extract
       * the postal_code component. This zip code is then merged into our property
       * data storage to ensure complete address information for estimates.
       */
      let zip: string | undefined
      if (data.result.address_components) {
        const postalComponent = data.result.address_components.find(
          (component) => component.types.includes('postal_code')
        )
        zip = postalComponent?.short_name
      }

      const coords: ApiCoords & { zip?: string } = {
        latitude: lat,
        longitude: lng,
        ...(zip && { zip })
      }
      return NextResponse.json(coords)
    }

    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 })
    }

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json(
        { error: 'API request denied. Check your API key and restrictions.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: `Google API error: ${data.status}` },
      { status: 500 }
    )
  } catch (error) {
    console.error('Google Places API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
