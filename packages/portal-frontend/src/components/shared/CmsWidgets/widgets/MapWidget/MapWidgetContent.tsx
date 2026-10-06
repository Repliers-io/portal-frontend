'use client'

import { useRef } from 'react'

import { Box, CircularProgress } from '@mui/material'

import {
  ListingPopupHost,
  MapContainer,
  MapControlsStack,
  MapNavigation,
  MapStyleSwitch
} from '@shared/Map'
import { type MarkerSize } from '@shared/Map'

import { type ApiQueryParams } from 'services/API'
import { type Filters } from 'services/Search'

import { useMapboxInstance } from './hooks/useMapboxInstance'

export interface MapWidgetContentProps {
  height?: number
  zoom?: number
  center?: [number, number]
  listings?: Partial<ApiQueryParams & Filters>
  markerSize?: MarkerSize
  fitToListings?: boolean
  zoomButtons?: boolean
  styleButtons?: boolean
  scrollZoom?: boolean
}

export const MapWidgetContent = ({
  height = 400,
  zoom = 10,
  center,
  listings,
  markerSize = 'tag',
  fitToListings = false,
  zoomButtons = false,
  styleButtons = false,
  scrollZoom = false
}: MapWidgetContentProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const filters = listings

  const { mapRef, loading, fetching } = useMapboxInstance({
    zoom,
    center,
    filters,
    markerSize,
    containerRef,
    fitToListings,
    scrollZoom
  })

  return (
    <Box
      sx={{
        height,
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Mapbox container */}
      <MapContainer ref={containerRef} />
      <ListingPopupHost mapRef={mapRef} />

      {/* Map controls */}
      {(zoomButtons || styleButtons) && (
        <MapControlsStack>
          {zoomButtons && <MapNavigation />}
          {styleButtons && <MapStyleSwitch />}
        </MapControlsStack>
      )}

      {!loading && fetching && (
        <Box sx={{ top: 16, left: 16, zIndex: 10, position: 'absolute' }}>
          <CircularProgress size={18} />
        </Box>
      )}
    </Box>
  )
}
