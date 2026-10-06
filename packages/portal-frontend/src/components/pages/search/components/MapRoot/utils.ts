import { type Map as MapboxMap } from 'mapbox-gl'

import { styleReady } from 'utils/map/style'

/**
 * Terrain exaggeration multiplier
 * 1.0 = realistic heights, 1.5 = balanced, 2.0+ = dramatic
 */
const TERRAIN_EXAGGERATION = 1.5

/**
 * Hide house numbers and address labels on the map
 * Used for non-authenticated users when restriction is enabled
 */
export const hideAddressLabels = (map: MapboxMap): void => {
  const style = map.getStyle()
  const { layers } = style || {}

  if (!layers) return

  layers.forEach((layer) => {
    if (
      layer.id.includes('housenum') ||
      layer.id.includes('house-num') ||
      layer.id.includes('building-number') ||
      layer.id.includes('address')
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
  })
}

/**
 * Setup map style load handler with feature-based restrictions
 */
export const setupStyleLoadHandler = (props: {
  map: MapboxMap
  logged: boolean
}): void => {
  const { map } = props
  const handleStyleLoad = () => {
    if (!props.logged) {
      hideAddressLabels(map)
    }
  }

  map.on('style.load', handleStyleLoad)
}

/**
 * Toggle terrain on/off when switching between 2D/3D modes
 */
export const toggleTerrain = (map: MapboxMap, enabled: boolean): void => {
  if (!styleReady(map)) return
  if (!map.getSource('mapbox-dem')) return

  if (enabled) {
    map.setTerrain({
      source: 'mapbox-dem',
      exaggeration: TERRAIN_EXAGGERATION
    })
  } else {
    map.setTerrain(null)
  }
}

/**
 * Setup terrain DEM source and auto-enable terrain based on 3D mode
 * Handles all terrain logic: source creation, style changes, and 3D mode toggling
 */
export const setupTerrain = (props: {
  map: MapboxMap
  getMode3D: () => boolean
}): void => {
  const { map, getMode3D } = props

  const addSourceAndEnableTerrain = () => {
    // Add source if it doesn't exist
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })
    }
    // Enable terrain based on current mode
    toggleTerrain(map, getMode3D())
  }

  // Re-add source and re-enable terrain on style changes
  // Note: map.setStyle() completely replaces the style, removing all custom sources and terrain.
  // This is Mapbox architecture - we must re-apply terrain after each style change.
  map.once('load', addSourceAndEnableTerrain)
  map.on('style.load', addSourceAndEnableTerrain)
}
