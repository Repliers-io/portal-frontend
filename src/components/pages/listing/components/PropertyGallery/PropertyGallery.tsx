'use client'

import React, { useEffect, useMemo, useState } from 'react'
import queryString from 'query-string'

import { Stack } from '@mui/material'

import { useProperty } from 'providers/PropertyProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import {
  DesktopGallery,
  MobileGallery,
  ThumbnailsRibbon,
  ThumbnailsSkeleton
} from './components'

const PropertyGallery = () => {
  const { property } = useProperty()
  const startImage = useMemo(() => {
    const params = queryString.parse(
      typeof window !== 'undefined' ? window.location.search : '',
      {
        types: {
          startImage: 'number'
        }
      }
    )
    return (params.startImage || 0) as number
  }, [property])

  const [activeIndex, setActiveIndex] = useState(startImage)
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(startImage)

  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()

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
  }, [property])

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
            <MobileGallery active={activeIndex} onChange={handleChange} />
          ) : (
            <DesktopGallery active={activeIndex} onChange={handleChange} />
          )}

          <ThumbnailsRibbon
            active={activeThumbnailIndex}
            onClick={handleChange}
          />
        </>
      ) : (
        <ThumbnailsSkeleton />
      )}
    </Stack>
  )
}

export default PropertyGallery
