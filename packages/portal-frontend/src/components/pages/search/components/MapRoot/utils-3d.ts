import { type Map as MapboxMap } from 'mapbox-gl'

import mapConfig from '@configs/map'

export const applyMapPitch = (map: MapboxMap): void => {
  const { map3D } = mapConfig
  map.easeTo({
    pitch: map3D.pitch.default,
    duration: map3D.animation.duration
  })
}

export const resetMapRotation = (map: MapboxMap): void => {
  map.easeTo({
    bearing: 0,
    duration: mapConfig.map3D.animation.duration
  })
}

export const resetMapOrientation = (map: MapboxMap): void => {
  map.easeTo({
    pitch: 0,
    bearing: 0,
    duration: mapConfig.map3D.animation.duration
  })
}
