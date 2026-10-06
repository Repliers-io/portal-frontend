'use client'

import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import mapConfig from '@configs/map'
import { CmsContentRenderer } from '@shared/CmsContentRenderer'
import { HomeMap } from '@shared/Map'

import MapOptionsProvider from 'providers/MapOptionsProvider'

import { BuildingSectionContainer } from './BuildingSectionContainer'

interface BuildingMapProps {
  id?: string
  lat?: string | number
  lng?: string | number
  zoom?: number
  title?: string
  description?: string
}

export const BuildingMap = ({
  id = 'location',
  lat,
  lng,
  zoom: mapZoom,
  title,
  description
}: BuildingMapProps) => {
  if (!lat || !lng) return null

  const latitude = Number(lat)
  const longitude = Number(lng)

  const zoom = mapZoom ?? mapConfig.zoom.listingAddress

  return (
    <BuildingSectionContainer id={id}>
      {description && (
        <Box sx={{ '& b, & strong': { fontFamily: 'Poppins, sans-serif' } }}>
          <CmsContentRenderer content={description} />
        </Box>
      )}

      <Suspense>
        <MapOptionsProvider layout="map" style="hybrid">
          <HomeMap
            lng={longitude}
            lat={latitude}
            zoom={zoom}
            title={title}
            exploreButton
            marker={{ symbol: 'building' }}
            type="interactive"
          />
        </MapOptionsProvider>
      </Suspense>
    </BuildingSectionContainer>
  )
}
