import queryString from 'query-string'

import {
  type Bbox,
  type Category,
  type NormalizedCollection,
  type NormalizedPoi
} from './_lib'

// Mapbox Search Box canonical category ids per our internal category key.
const canonicalByCategory: Record<Category, string> = {
  grocery: 'grocery',
  bus: 'bus_station',
  subway: 'subway_station',
  train: 'train_station'
}

const token = (): string => process.env.MAPBOX_SEARCHBOX_KEY || ''

const referer = (): string => process.env.MAPBOX_SEARCHBOX_REFERER || ''

export const searchboxConfigured = (): boolean => token().length > 0

type SearchBoxFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    mapbox_id?: string
    name?: string
    full_address?: string
    address?: string
    place_formatted?: string
    poi_category?: string[]
    poi_category_ids?: string[]
  }
}

type SearchBoxResponse = {
  type: 'FeatureCollection'
  features: SearchBoxFeature[]
}

const fetchCategory = async (
  category: Category,
  bbox: Bbox,
  proximity: [number, number] | null,
  limit: number,
  accessToken: string,
  signal: AbortSignal
): Promise<NormalizedPoi[]> => {
  const canonical = canonicalByCategory[category]
  const qs = queryString.stringify({
    bbox: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`,
    limit: Math.min(limit, 25),
    access_token: accessToken,
    ...(proximity && { proximity: `${proximity[0]},${proximity[1]}` })
  })

  const url =
    'https://api.mapbox.com/search/searchbox/v1/category/' +
    `${encodeURIComponent(canonical)}?${qs}`

  const res = await fetch(url, {
    signal,
    headers: referer() ? { Referer: referer() } : {}
  })
  if (!res.ok) throw new Error(`Search Box upstream failed: ${res.status}`)

  const data = (await res.json()) as SearchBoxResponse
  return data.features.map((f, i) => ({
    type: 'Feature',
    geometry: f.geometry,
    properties: {
      id: f.properties?.mapbox_id || `sb-${canonical}-${i}`,
      name: f.properties?.name || 'Unnamed',
      address:
        f.properties?.full_address ||
        f.properties?.address ||
        f.properties?.place_formatted ||
        null,
      category
    }
  }))
}

export const fetchFromSearchBox = async (
  categories: Category[],
  bbox: Bbox,
  proximity: [number, number] | null,
  limit: number,
  signal: AbortSignal
): Promise<NormalizedCollection> => {
  const accessToken = token()
  if (!accessToken) throw new Error('MAPBOX_SEARCHBOX_TOKEN not configured')

  const results = await Promise.all(
    categories.map((category) =>
      fetchCategory(category, bbox, proximity, limit, accessToken, signal)
    )
  )

  return { type: 'FeatureCollection', features: results.flat() }
}
