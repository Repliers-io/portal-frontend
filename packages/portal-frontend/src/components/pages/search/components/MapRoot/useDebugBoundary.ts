import { useEffect } from 'react'

import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { executeOnStyleLoad } from 'utils/map/style'

export const useDebugBoundary = (mapReady: boolean) => {
  const { mapRef } = useMapOptions()

  // DEBUG: draw defaultPolygon bbox and boundary on map load.
  // Enable via mapConfig.searchArea.debug = true.
  useEffect(() => {
    if (!mapReady || !mapConfig.searchArea.debug) return
    const map = mapRef.current
    if (!map) return

    const drawDebug = () => {
      const { defaultPolygon, boundary } = mapConfig.searchArea
      const bboxRing = defaultPolygon.map(
        ({ lat, lng }) => [lng, lat] as [number, number]
      )
      bboxRing.push(bboxRing[0])

      if (!map.getSource('__debug_bbox')) {
        map.addSource('__debug_bbox', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [bboxRing] }
          }
        })
        map.addLayer({
          id: '__debug_bbox_fill',
          source: '__debug_bbox',
          type: 'fill',
          paint: { 'fill-color': '#0000ff', 'fill-opacity': 0.05 }
        })
        map.addLayer({
          id: '__debug_bbox_line',
          source: '__debug_bbox',
          type: 'line',
          paint: { 'line-color': '#0000ff', 'line-width': 2 }
        })
      }

      if (boundary && !map.getSource('__debug_boundary')) {
        map.addSource('__debug_boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'MultiPolygon', coordinates: boundary }
          }
        })
        map.addLayer({
          id: '__debug_boundary_fill',
          source: '__debug_boundary',
          type: 'fill',
          paint: { 'fill-color': '#ff0000', 'fill-opacity': 0.07 }
        })
        map.addLayer({
          id: '__debug_boundary_line',
          source: '__debug_boundary',
          type: 'line',
          paint: { 'line-color': '#ff0000', 'line-width': 2 }
        })
      }
    }

    return executeOnStyleLoad(map, drawDebug)
  }, [mapReady])
}
