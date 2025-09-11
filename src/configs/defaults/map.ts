import { type MapOptions } from 'mapbox-gl'

import mapStyles, { type MapStyle } from '@configs/map-styles'

export { type MapStyle, mapStyles }

export const defaultAreaZoom = 13
export const fallbackAreaZoom = 11
export const defaultAddressZoom = 15
export const propertyPageAddressZoom = 18

export const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_KEY || ''
export const mapboxDefaults: Partial<MapOptions> = {
  zoom: 8,
  minZoom: 7,
  maxZoom: 18,
  dragRotate: false,
  doubleClickZoom: true,
  attributionControl: false,
  logoPosition: 'bottom-left',
  accessToken: mapboxToken
}

export const defaultPolygon = [
  { lat: 43.750329, lng: -79.640622 },
  { lat: 43.855428, lng: -79.169572 },
  { lat: 43.717762, lng: -79.117391 },
  { lat: 43.585801, lng: -79.540348 }
]

export const proximitySearchCountry = 'CA'
export const proximitySearchLanguage = 'en'
export const proximitySearchLimit = 10
export const proximitySearchCenter = { lat: 43.6532, lng: -79.3832 }
