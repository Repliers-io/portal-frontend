'use client'

import React, { useEffect, useState } from 'react'

import { Stack } from '@mui/material'

import { type ImagePlaceholderIconType } from 'components/atoms/ImagePlaceholder'

import { type PropertyInsights } from 'services/API'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import {
  DesktopGallery,
  MobileGallery,
  ThumbnailsRibbon,
  ThumbnailsSkeleton
} from './components'

export type ImageResolvers = {
  small: (image: unknown) => string
  medium: (image: unknown) => string
  large: (image: unknown) => string
}

export const HeroGallery = ({
  images,
  resolvers,
  startImage = 0,
  icon = 'house',
  blurred = false,
  gridGallery = false,
  fullscreenGallery = false,
  slideshowGallery = false,
  imageActions = false,
  imageInsights,
  children
}: {
  images: unknown[]
  resolvers: ImageResolvers
  startImage?: number
  icon?: ImagePlaceholderIconType
  blurred?: boolean
  gridGallery?: boolean
  fullscreenGallery?: boolean
  slideshowGallery?: boolean
  imageActions?: boolean
  imageInsights?: PropertyInsights
  children?: React.ReactNode
}) => {
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()

  const [activeIndex, setActiveIndex] = useState(startImage)
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(startImage)

  const handleChange = (index: number) => {
    if (index === activeIndex) return
    setActiveIndex(index)
    setActiveThumbnailIndex(index)
  }

  // reset gallery index on property change
  // WARN: but DO NOT touch thumbnails, as they have internal state
  // and their own logic to update active thumbnail
  useEffect(() => {
    setActiveIndex(startImage)
  }, [images])

  return (
    <Stack
      spacing={2}
      alignItems="stretch"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ position: 'relative' }}
    >
      {clientSide ? (
        <>
          {mobile ? (
            <MobileGallery
              icon={icon}
              images={images}
              resolvers={resolvers}
              blurred={blurred}
              active={activeIndex}
              fullscreenGallery={fullscreenGallery}
              onChange={handleChange}
            />
          ) : (
            <DesktopGallery
              icon={icon}
              images={images}
              resolvers={resolvers}
              blurred={blurred}
              active={activeIndex}
              gridGallery={gridGallery}
              fullscreenGallery={fullscreenGallery}
              imageActions={imageActions}
              imageInsights={imageInsights}
              onChange={handleChange}
            />
          )}

          <ThumbnailsRibbon
            images={images}
            resolvers={resolvers}
            blurred={blurred}
            active={activeThumbnailIndex}
            slideshowGallery={slideshowGallery}
            onClick={handleChange}
          />
        </>
      ) : (
        <ThumbnailsSkeleton />
      )}

      {children}
    </Stack>
  )
}
