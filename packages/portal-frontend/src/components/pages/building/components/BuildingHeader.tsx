'use client'

import React, { Suspense, useState } from 'react'
import Image from 'next/image'

import { Box, Container, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import listingsConfig from '@configs/listings'
import mapConfig from '@configs/map'
import { Breadcrumbs } from '@shared/Breadcrumbs'
import {
  FullscreenGalleryDialog,
  FullscreenRibbonDialog,
  GalleryDialog,
  SlideshowDialog
} from '@shared/Dialogs'
import { HeroGallery } from '@shared/HeroGallery'
import { HomeMap } from '@shared/Map'

import { ImagePlaceholder } from 'components/atoms'

import { type SlideshowImage, useBuilding } from 'providers/BuildingProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import { getCDNPath } from 'utils/urls'

import { resolvers } from '../utils'

import { BuildingNavigationBar } from '.'

const { listingCardSizes } = gridConfig

// --- Gallery mode (CMS-enriched: ≥2 images) ---

const GalleryHeader = ({ gallery }: { gallery: SlideshowImage[] }) => {
  const {
    fullscreenGallery: fullscreenEnabled,
    gridGallery: gridEnabled,
    slideshow
  } = listingsConfig.components

  const fullscreenGallery = fullscreenEnabled || gridEnabled
  const gridGallery =
    gridEnabled && gallery.length >= listingsConfig.gallery.minImagesFor123

  return (
    <HeroGallery
      icon="business"
      images={gallery}
      resolvers={resolvers}
      gridGallery={gridGallery}
      slideshowGallery={slideshow}
      fullscreenGallery={fullscreenGallery}
    />
  )
}

// --- Image + Map mode (API-only or CMS with ≤1 image) ---

const ImageMapHeader = ({
  heroImage,
  map
}: {
  heroImage?: string
  map?: { lat: number; lng: number }
}) => {
  const [imageError, setImageError] = useState(false)
  const image = heroImage ? getCDNPath(heroImage, 'large') : undefined
  const icon = 'commercial'
  const zoom = mapConfig.zoom.listingAddress
  const mapWidth = Number(listingCardSizes.medium.width) * 2 + 16

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
    >
      <Box
        sx={{
          flex: { md: 1 },
          minHeight: 412,
          maxWidth: { md: 632 },
          width: { xs: '100%', md: 'auto' },
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <ImagePlaceholder icon={icon} />

        {image && !imageError && (
          <Box sx={{ inset: 0, position: 'absolute' }}>
            <Image
              alt=""
              priority
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
              src={image}
              onError={() => setImageError(true)}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          flex: { md: 1 },
          width: { xs: '100%', md: 'auto' },
          maxWidth: { md: mapWidth },
          minHeight: 412,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {map ? (
          <Suspense>
            <MapOptionsProvider layout="map" style="hybrid">
              <HomeMap
                type="interactive"
                lng={map.lng}
                lat={map.lat}
                zoom={zoom}
                height={412}
                marker={{ symbol: 'building' }}
              />
            </MapOptionsProvider>
          </Suspense>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              bgcolor: 'background.default',
              fontSize: 14,
              color: 'text.hint',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
      </Box>
    </Stack>
  )
}

export const BuildingHeader = () => {
  const building = useBuilding()
  const { gallery, heroImage, map, breadcrumbs } = building

  const galleryMode = gallery.length >= 2
  const { gridGallery, slideshow, fullscreenGallery } =
    listingsConfig.components

  return (
    <>
      <Container sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Breadcrumbs items={breadcrumbs} home />

          {galleryMode ? (
            <GalleryHeader gallery={gallery} />
          ) : (
            <ImageMapHeader heroImage={heroImage} map={map} />
          )}
        </Stack>
      </Container>

      <BuildingNavigationBar />

      {galleryMode && gridGallery && <GalleryDialog />}
      {galleryMode && slideshow && <SlideshowDialog />}
      {galleryMode && fullscreenGallery && <FullscreenRibbonDialog />}
      {galleryMode && fullscreenGallery && <FullscreenGalleryDialog />}
    </>
  )
}
