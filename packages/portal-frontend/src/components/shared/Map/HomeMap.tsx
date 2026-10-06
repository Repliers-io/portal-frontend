import React, { useRef } from 'react'
import Link from 'next/link'
import { type Position } from 'geojson'
import mapboxgl, {
  type Map as MapboxMap,
  Marker as MapboxMarker
} from 'mapbox-gl'

import { Box, Button, Stack, Typography } from '@mui/material'

import { markerColors } from '@configs/colors'
import features from '@configs/features'
import { ExploreIcon } from '@configs/icons'
import mapConfig from '@configs/map'

import { ScrubbedText } from 'components/atoms'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { formatPrice, type Primitive } from 'utils/formatters'
import {
  addBoundaryPolygon,
  executeOnStyleLoad,
  getBoundaryBounds,
  getGoogleMapUrl,
  getMapboxStaticImageUrl,
  getMapUrl
} from 'utils/map'

import { useMapInit, useMapStyleSync } from './hooks'
import { createMarkerElement, markerKind } from './markerElement'
import {
  MapCenterButton,
  MapContainer,
  MapControlsStack,
  MapNavigation,
  MapStyleSwitch,
  type MarkerSize
} from '.'

const noop = (): void => undefined

export interface HomeMapProps {
  /** Longitude */
  lng: number
  /** Latitude */
  lat: number
  /** Zoom level */
  zoom: number
  /** Optional boundary polygon to fit and render */
  boundary?: Position[][][] | Position[][]
  /** Initial viewport, fitted with `boundsPadding`; nothing is drawn. */
  bounds?: mapboxgl.LngLatBounds
  /** Pixels kept around `bounds` / `boundary` on every side (default: 10) */
  boundsPadding?: number
  /** Optional feature toggle for rendering map controls */
  controls?: boolean
  /** Title displayed above the map */
  title?: React.ReactNode
  /** Marker configuration with price, status and symbol; none draws no marker. */
  marker?: {
    price?: Primitive
    status?: string
    symbol?: string
    size?: MarkerSize
  }
  /** Interactive or static mode */
  type?: 'interactive' | 'static'
  /** Click handler for static map */
  onClick?: (e: React.MouseEvent) => void
  /** Custom static image URL (if provided, overrides automatic generation) */
  customImageUrl?: string
  /** Static image dimensions */
  imageWidth?: number
  imageHeight?: number
  exploreButton?: boolean
  /** Distance threshold in meters to show recenter button (default: 100) */
  recenterThreshold?: number
  /** Map container height in px (default: 298) */
  height?: number
}

export const HomeMap = ({
  type = 'interactive',
  lng,
  lat,
  zoom,
  controls = true,
  boundary,
  bounds,
  boundsPadding = 10,
  title,
  marker,
  onClick,
  customImageUrl,
  imageWidth = 858,
  imageHeight = 298,
  exploreButton = false,
  recenterThreshold,
  height = 298
}: HomeMapProps) => {
  const mapRef = useRef<MapboxMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { setPosition } = useMapOptions()

  const center = new mapboxgl.LngLat(lng, lat)

  // Generate static image URL if in static mode and no custom URL provided
  const staticImageProvider = mapConfig.provider || 'mapbox'

  const staticImageUrl =
    type === 'static' && !customImageUrl
      ? staticImageProvider === 'mapbox'
        ? getMapboxStaticImageUrl({
            zoom,
            point: { longitude: lng, latitude: lat },
            symbol: marker?.symbol || 'home',
            width: imageWidth,
            height: imageHeight
          })
        : undefined // TODO: Google Maps static API would go here
      : customImageUrl

  const getLink = mapConfig.provider === 'google' ? getGoogleMapUrl : getMapUrl
  const link = getLink({ center, zoom })

  const initialBounds =
    bounds ??
    (boundary && boundary.length > 0 ? getBoundaryBounds(boundary) : undefined)

  const styleLoadCleanupRef = useRef<() => void>(noop)

  useMapStyleSync()

  useMapInit({
    containerRef,
    center,
    zoom,
    initialBounds,
    fitBoundsOptions: { padding: boundsPadding, animate: false },
    enabled: type === 'interactive',
    scrollZoom: false,
    touchZoomRotate: false,
    // `setMapRef` only writes a ref, so the map's arrival never re-renders on its
    // own. Publishing the viewport is what tells this provider's consumers — the
    // parcel under the listing, anything added later — that the map is ready.
    onLoad: (bounds, center, zoom) => setPosition({ bounds, center, zoom }),
    onMove: (bounds, center, zoom) => setPosition({ bounds, center, zoom }),
    onInit: (map) => {
      if (marker) {
        const element = createMarkerElement({
          kind: markerKind(marker.size, marker.price),
          color: markerColors.default.color,
          label: formatPrice(marker.price)
        })
        new MapboxMarker(element).setLngLat(center).addTo(map)
      }

      if (boundary?.length) {
        styleLoadCleanupRef.current = executeOnStyleLoad(map, () =>
          addBoundaryPolygon(map, boundary)
        )
      }

      mapRef.current = map
    },
    onCleanup: () => {
      styleLoadCleanupRef.current()
      mapRef.current = null
    }
  })

  const handleClick = (e: React.MouseEvent) => {
    if (type === 'static' && onClick) {
      onClick(e)
      e.preventDefault() // stop natural link behavior if we're handling the click
    }
  }

  const outerSx = {
    height: height,
    overflow: 'hidden',
    mx: { xs: -2, sm: 0 },
    borderRadius: { xs: 0, sm: 2 },
    contentVisibility: 'visible'
  }

  return (
    <Stack spacing={3}>
      {title && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Typography variant="h4">
            <span style={{ marginRight: 8 }}>
              <ScrubbedText>{title}</ScrubbedText>
            </span>
            <span
              style={{
                alignItems: 'center'
              }}
            >
              <MapCenterButton
                zoom={zoom}
                center={center}
                mapRef={mapRef}
                recenterThreshold={recenterThreshold}
              />
            </span>
          </Typography>

          {features.map && exploreButton && (
            <Button
              href={link}
              target="_blank"
              onClick={handleClick}
              endIcon={<ExploreIcon />}
              sx={{
                my: -0.75,
                mr: { xs: -1, sm: 0 },
                height: '38px',
                flexShrink: 0
              }}
            >
              Explore
            </Button>
          )}
        </Stack>
      )}

      {type === 'static' && staticImageUrl ? (
        <Link href={link} onClick={handleClick}>
          <Box
            sx={outerSx}
            style={{
              backgroundColor: '#e9e6e0',
              backgroundImage: `url("${staticImageUrl}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
        </Link>
      ) : (
        <Box sx={{ ...outerSx, position: 'relative' }}>
          <MapContainer ref={containerRef} />

          {controls && (
            <MapControlsStack>
              <MapNavigation />
              <MapStyleSwitch />
            </MapControlsStack>
          )}
        </Box>
      )}
    </Stack>
  )
}
