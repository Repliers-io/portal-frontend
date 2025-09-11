'use client'

import React, { useEffect, useRef } from 'react'
import { type Position } from 'geojson'
import { type LngLatLike, Map as MapboxMap } from 'mapbox-gl'

import { Box } from '@mui/material'

import { fallbackAreaZoom, mapboxDefaults } from '@configs/map'
import { MapStyleSwitch } from '@shared/Map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import {
  addPolygon,
  getDefaultBounds,
  getMapStyleUrl,
  getPositionBounds,
  removePolygon
} from 'utils/map'

const CatalogMap = ({
  center,
  coordinates
}: {
  center?: LngLatLike | null
  coordinates?: Position[][] | null
}) => {
  const { style, position } = useMapOptions()
  const mapRef = useRef<MapboxMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(undefined)

  const initializeMap = (container: HTMLElement) => {
    mapRef.current = new MapboxMap({
      container,
      ...mapboxDefaults,
      touchZoomRotate: false,
      style: getMapStyleUrl(style),
      bounds: position.bounds || getDefaultBounds(),
      zoom: position.zoom
    })
  }

  useEffect(() => {
    const map = mapRef.current
    if (map?.loaded()) {
      if (coordinates || center) {
        if (coordinates) {
          map.fitBounds(getPositionBounds(coordinates[0]), {
            padding: 60,
            curve: 1
          })
          removePolygon(map)
          addPolygon(map, coordinates[0])
        } else if (center) {
          map.flyTo({ center, zoom: fallbackAreaZoom, curve: 1 })
        }
      } else {
        removePolygon(map)
        // Reset map position
        if (position.bounds) map.fitBounds(position.bounds, { curve: 1 })
      }
    }
  }, [coordinates, center])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize map only once
    if (!mapRef.current) {
      initializeMap(containerRef.current)
    }

    const map = mapRef.current
    if (!map) return

    // Create a ResizeObserver to handle container resizing
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect()
      map.remove()
    }
  }, [])

  useEffect(() => {
    mapRef.current?.setStyle(getMapStyleUrl(style))
  }, [style])

  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: '#e9e6e0',
        overflow: 'hidden',
        position: 'relative',
        contentVisibility: 'visible',
        minWidth: { xs: 'auto', md: 576 },
        minHeight: 364
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          '& .active': {
            zIndex: 1000
          }
        }}
      />
      <MapStyleSwitch />
    </Box>
  )
}

CatalogMap.displayName = 'CatalogMap'

export default CatalogMap
