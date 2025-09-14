'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import { type Property } from 'services/API'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import useResponsiveValue from 'hooks/useResponsiveValue'

import { PropertyCard } from '..'

import {
  CarouselContainer,
  CarouselHeader,
  CarouselSkeleton
} from './components'

type PropertyCarouselProps = {
  title?: string
  loop?: boolean
  openInNewTab?: boolean
  properties: Property[]
  onCardClick?: (e: React.MouseEvent) => void
}

const { cardCarouselSpacing, propertyCardSizes } = gridConfig

const PropertyCarousel = ({
  title = '',
  loop = true,
  openInNewTab,
  properties,
  onCardClick
}: PropertyCarouselProps) => {
  const clientSide = useClientSide()
  const { mobile, wideScreen } = useBreakpoints()
  const slidesToShow = useResponsiveValue({ xs: 1, sm: 2, md: 3, lg: 4 }) || 4

  const carouselWidth = useMemo(() => {
    return wideScreen || !clientSide
      ? Number(propertyCardSizes.normal.width) * slidesToShow +
          cardCarouselSpacing * 8 * (slidesToShow - 1)
      : '100%'
  }, [wideScreen, slidesToShow])

  // show navigation controls AND activate carousel only if there are more properties than slides to show
  const activateCarousel = properties.length > slidesToShow

  const [galleryHovered, setGalleryHovered] = useState(false)

  const [carouselRef, carouselApi] = useEmblaCarousel({
    active: activateCarousel,
    containScroll: mobile ? false : 'trimSnaps',
    align: wideScreen ? 'start' : 'center',
    loop
  })

  const handlePrevClick = useCallback(() => {
    carouselApi?.scrollPrev()
  }, [carouselApi])

  const handleNextClick = useCallback(() => {
    carouselApi?.scrollNext()
  }, [carouselApi])

  useEffect(() => {
    // reInit carousel with disabled drag if one of the internal galleries
    // of PropertyCards is hovered
    // prevents scrolling of both carousels at the same time
    carouselApi?.reInit({ watchDrag: !galleryHovered })
  }, [galleryHovered, carouselApi])

  useEffect(() => {
    return () => carouselApi?.destroy()
  }, [])

  useEffect(() => {
    carouselApi?.scrollTo(0, true)
  }, [properties])

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: carouselWidth },
        mx: { lg: 1.5 },
        display: 'inline-block'
      }}
    >
      {title && (
        <CarouselHeader
          title={title}
          navigation={activateCarousel}
          onPrev={handlePrevClick}
          onNext={handleNextClick}
        />
      )}
      <CarouselContainer>
        {!properties.length ? (
          <CarouselSkeleton />
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ overflow: 'hidden' }} ref={carouselRef}>
              <Box
                sx={{
                  display: 'flex',
                  willChange: 'transform' /* embla-container */,
                  ...(!activateCarousel && { justifyContent: 'center' })
                }}
              >
                {properties.map((property, index) => (
                  <Box
                    py={cardCarouselSpacing}
                    px={cardCarouselSpacing / 2}
                    boxSizing="border-box"
                    key={`${property.mlsNumber}-${index}`}
                  >
                    <PropertyCard
                      property={property}
                      openInNewTab={openInNewTab}
                      onClick={onCardClick}
                      onGalleryEnter={() => setGalleryHovered(true)}
                      onGalleryLeave={() => setGalleryHovered(false)}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </CarouselContainer>
    </Box>
  )
}

export default PropertyCarousel
