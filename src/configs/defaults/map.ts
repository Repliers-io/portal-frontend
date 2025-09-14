import { type MapOptions } from 'mapbox-gl'

import { type ApiLocation } from 'services/API'

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY || ''

const config = {
  // Mapbox access token and default options
  mapboxDefaults: {
    zoom: 4,
    minZoom: 4,
    maxZoom: 18,
    dragRotate: false,
    doubleClickZoom: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
    accessToken
  } as Partial<MapOptions>,
  // Mapbox map styles
  mapStyles: {
    map: 'streets-v12',
    hybrid: 'satellite-streets-v12',
    satellite: 'satellite-v9'
  },
  // zoom levels for search area and addresses
  defaultAreaZoom: 13,
  fallbackAreaZoom: 11,
  defaultAddressZoom: 15,
  propertyPageAddressZoom: 18,
  // Default polygon to limit searches and Repliers API requests (!)
  defaultPolygon: [
    { lat: 50.0, lng: -130.0 },
    { lat: 50.0, lng: -65.0 },
    { lat: 23.5, lng: -65.0 },
    { lat: 23.5, lng: -130.0 }
  ] as ApiLocation[],
  // proximity search
  proximitySearchCenter: { lat: 37.0, lng: -98.5 } as ApiLocation,
  proximitySearchLanguage: 'en',
  proximitySearchCountry: 'US',
  proximitySearchLimit: 10
}

export type MapStyle = keyof typeof config.mapStyles

export default config
