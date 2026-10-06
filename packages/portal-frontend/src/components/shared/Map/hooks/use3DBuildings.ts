import { useEffect } from 'react'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { executeOnStyleLoad } from 'utils/map'
import { buildingsLayer, buildingWindowColor } from 'utils/map/buildingWindows'

/**
 * Manages 3D buildings layer based on map style and 3D mode
 * Only shows buildings on 'map' style when 3D mode is enabled
 */
export const use3DBuildings = () => {
  const { mode3D, style: mapStyle, shadows, mapRef } = useMapOptions()
  const map = mapRef?.current

  useEffect(() => {
    if (!map) return

    const addBuildingsLayer = () => {
      const showBuildings = mode3D && mapStyle === 'map'
      const layerExists = map.getLayer(buildingsLayer)

      if (showBuildings && !layerExists) {
        const layers = map.getStyle().layers

        const beforeLayer = layers.find(
          (layer) =>
            layer.type === 'symbol' &&
            (layer.id.includes('poi') ||
              layer.id.includes('transit') ||
              layer.id.includes('airport'))
        )
        // Add 3D buildings layer
        map.addLayer(
          {
            id: buildingsLayer,
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': buildingWindowColor,
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': shadows ? 1 : 0.5
            }
          },
          beforeLayer?.id
        )
      } else if (!showBuildings && layerExists) {
        // Remove 3D buildings layer
        map.removeLayer(buildingsLayer)
      } else if (layerExists) {
        map.setPaintProperty(
          buildingsLayer,
          'fill-extrusion-opacity',
          shadows ? 1 : 0.5
        )
      }
    }

    // Add the layer once the style is ready — 3D mode can arrive pre-activated
    // from the URL while the initial style is still loading
    const cancelInitialAdd = executeOnStyleLoad(map, addBuildingsLayer)

    // Re-add layer after style changes (style.load event fires when map.setStyle() completes)
    map.on('style.load', addBuildingsLayer)

    return () => {
      cancelInitialAdd()
      map.off('style.load', addBuildingsLayer)
    }
  }, [map, mode3D, mapStyle, shadows])
}
