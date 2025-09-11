import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import mapboxgl, { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'

import ExploreIcon from '@mui/icons-material/Explore'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'

import { mapboxDefaults, propertyPageAddressZoom } from '@configs/map'
import { MapNavigation, MapStyleSwitch } from '@shared/Map'

import ScrubbedText from 'components/atoms/ScrubbedText'

import { createMarkerElement } from 'services/Map'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { useProperty } from 'providers/PropertyProvider'
import { formatPrice } from 'utils/formatters'
import {
  getGmapsStaticImageUrl,
  getGoogleMapUrl,
  getMapboxStaticImageUrl,
  getMapStyleUrl,
  getMapUrl
} from 'utils/map'
import { formatShortAddress } from 'utils/properties'

const HomeMap = ({
  type = 'interactive'
}: {
  type?: 'interactive' | 'static'
}) => {
  const features = useFeatures()
  const mapRef = useRef<MapboxMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(undefined)

  const { property } = useProperty()
  const { address } = property
  // WARN: depending of the `embedded` prop, MapOptionsProvider instance
  // will be different, pointing to different map instances
  // NOTE: `pageMap` is the main instance for the `/search/map` page route
  const { setLayout, style, mapRef: pageMapRef, setMapRef } = useMapOptions()
  const { hideDialog } = useDialog('property')
  const [showRecenter, setShowRecenter] = useState(false)

  const {
    map: { longitude, latitude },
    listPrice,
    status
  } = property

  const center = new mapboxgl.LngLat(Number(longitude), Number(latitude))
  const zoom = propertyPageAddressZoom

  const getLink =
    features.pdpMapProvider === 'google' ? getGoogleMapUrl : getMapUrl
  const link = getLink({ center, zoom })

  const getStaticImageUrl =
    features.pdpMapProvider === 'google'
      ? getGmapsStaticImageUrl
      : getMapboxStaticImageUrl

  const staticImageUrl = getStaticImageUrl({
    property,
    point: property.map,
    height: 298,
    width: 858,
    zoom
  })

  const initializeMap = (container: HTMLElement) => {
    const center = new mapboxgl.LngLat(Number(longitude), Number(latitude))

    const map = new MapboxMap({
      container,
      ...mapboxDefaults,
      scrollZoom: false,
      touchZoomRotate: false,
      style: getMapStyleUrl(style),
      zoom: propertyPageAddressZoom,
      center
    })
    mapRef.current = map
    setMapRef(map)

    mapRef.current.on('moveend', () => setShowRecenter(true))

    new MapboxMarker(
      createMarkerElement({
        status,
        size: 'point', // or 'tag'
        label: formatPrice(listPrice)
      })
    )
      .setLngLat(center)
      .addTo(mapRef.current)
  }

  const handleMapClick = (e: React.MouseEvent) => {
    if (type === 'static' && pageMapRef.current) {
      e.preventDefault()
      setLayout('map')
      hideDialog()
      pageMapRef.current.flyTo({
        center,
        curve: 1,
        zoom: propertyPageAddressZoom
      })
    }
  }

  const handleMapRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center,
        curve: 1,
        zoom: propertyPageAddressZoom
      })
      mapRef.current.once('moveend', () => setShowRecenter(false))
    }
  }

  useEffect(() => {
    if (type === 'interactive' && containerRef.current) {
      initializeMap(containerRef.current)
    }
  }, [type])

  useEffect(() => {
    if (!style) return
    mapRef.current?.setStyle(getMapStyleUrl(style))
  }, [style])

  const container = (
    <Box
      ref={containerRef}
      sx={{
        height: 298,
        width: '100%',
        borderRadius: 2,
        bgcolor: '#e9e6e0',
        contentVisibility: 'visible',
        '& .active': {
          zIndex: 1000
        }
      }}
      style={{
        ...(type === 'static' && {
          backgroundImage: `url("${staticImageUrl}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        })
      }}
    />
  )

  return (
    <Stack spacing={3}>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h4">
          <Stack direction="row" spacing={1} alignItems="center">
            <ScrubbedText>
              {formatShortAddress(address)}, {address.city}
            </ScrubbedText>
            <Tooltip arrow enterDelay={200} placement="right" title="Recenter">
              <IconButton
                onClick={handleMapRecenter}
                sx={{
                  my: -1,
                  width: 38,
                  height: 38,
                  transition: 'opacity 0.3s',
                  ...(showRecenter
                    ? { opacity: 1, pointerEvents: 'auto' }
                    : { opacity: 0, pointerEvents: 'none' })
                }}
              >
                <GpsFixedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Typography>

        {features.map && (
          <Button
            target="_blank"
            href={link}
            onClick={handleMapClick}
            endIcon={<ExploreIcon />}
            sx={{
              pointerEvents: 'none',
              visibility: 'hidden',
              opacity: 0,

              my: -1,
              mr: { xs: -2, sm: 0 },
              height: '38px'
            }}
          >
            Explore
          </Button>
        )}
      </Stack>

      {type === 'static' ? (
        <Link href={link} target="_blank" onClick={handleMapClick}>
          {container}
        </Link>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {container}
          <MapNavigation />
          <MapStyleSwitch />
        </Box>
      )}
    </Stack>
  )
}

export default HomeMap
