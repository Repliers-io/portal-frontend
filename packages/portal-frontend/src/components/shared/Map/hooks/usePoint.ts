'use client'

import { useEffect, useRef } from 'react'
import type { FeatureCollection } from 'geojson'
import { Marker } from 'mapbox-gl'

import { SignpostOutlinedIcon } from '@configs/icons'
import mapConfig from '@configs/map'
import { createMarkerElement } from '@shared/Map/markerElement'
import { circle } from '@turf/turf'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { addPolygonToMap, removePolygonFromMap } from 'utils/map/polygons'
import { renderIconSvg } from 'utils/map/renderIconSvg'

import { useMapReady } from './useMapListener'

const {
  mapFlyCurve,
  zoom,
  marker: { pointColor }
} = mapConfig

const radiusSourceId = 'search-radius'
// Empty colour → resolvePolygonStyle keeps the base (search-area) palette.
const radiusConfig = {
  sourceId: radiusSourceId,
  layerId: radiusSourceId,
  color: '',
  context: 'static' as const
}
// Vertices approximating the circle — 64 reads smooth at every zoom.
const circleSteps = 64

/**
 * Renders the search point: a radius-less point as a Signpost pin (click
 * recenters on it), a point with a radius as a static circle area through the
 * shared polygon renderer.
 */
export const usePoint = (): void => {
  const { point } = useSearch()
  const { mapRef } = useMapOptions()
  const mapReady = useMapReady(mapRef)
  const markerRef = useRef<Marker | null>(null)

  const center = point && point.radius == null ? point.center : null
  const lat = center?.[0]
  const lng = center?.[1]

  useEffect(() => {
    markerRef.current?.remove()
    markerRef.current = null

    const map = mapRef.current
    if (!map || lat == null || lng == null) return

    const element = createMarkerElement({
      kind: 'icon-dot',
      color: pointColor,
      label: '',
      icon: renderIconSvg(SignpostOutlinedIcon)
    })
    // Sit above listing markers by default (z-index set in MapContainer).
    element.classList.add('lm--point')

    // Recenter on click — same fly as selecting the address in the autosuggest.
    element.addEventListener('click', () => {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom.address,
        ...mapFlyCurve
      })
    })

    markerRef.current = new Marker({ element }).setLngLat([lng, lat]).addTo(map)

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [lat, lng, mapReady, mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const draw = () => {
      if (point?.radius == null) {
        removePolygonFromMap(map, radiusConfig)
        return
      }
      // turf expects [lng, lat]; MapPoint.center is [lat, lng].
      const [lat, lng] = point.center
      const data: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          circle([lng, lat], point.radius, {
            units: 'kilometers',
            steps: circleSteps
          })
        ]
      }
      addPolygonToMap(map, radiusConfig, data)
    }

    // addPolygonToMap defers until the style is ready; style.load re-adds the
    // circle after a style switch (map / satellite / hybrid) wipes GL sources.
    draw()
    map.on('style.load', draw)

    return () => {
      map.off('style.load', draw)
      removePolygonFromMap(map, radiusConfig)
    }
  }, [point, mapReady, mapRef])
}
