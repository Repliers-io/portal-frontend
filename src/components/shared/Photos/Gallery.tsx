/* eslint-disable no-param-reassign */

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { Box } from '@mui/material'

import { type PropertyCardSize } from '@configs/cards-grids'

import {
  ImagePlaceholder,
  type ImagePlaceholderIconType
} from 'components/atoms'

import useBreakpoints from 'hooks/useBreakpoints'
import useIntersectionObserver from 'hooks/useIntersectionObserver'

import { GalleryControls, ImageContainer } from '.'

type GalleryProps = {
  images: string[]
  scores?: number[]
  blurred?: boolean
  size: PropertyCardSize
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onChange?: (index: number) => void
  start?: number
  icon?: ImagePlaceholderIconType
  loading?: 'lazy' | 'eager'
}

const Gallery = React.memo(
  ({
    size,
    images,
    scores,
    blurred,
    onChange,
    onMouseEnter,
    onMouseLeave,
    start = 0,
    icon = 'house',
    loading = 'lazy'
  }: GalleryProps) => {
    const sizeMap = size === 'map'
    const sizeDrawer = size === 'drawer'
    const cdnImageSize = blurred ? 'small' : 'medium'
    const blurVariant = sizeMap ? 'map' : 'card'

    const { mobile, tablet } = useBreakpoints()
    const [visible, containerRef] = useIntersectionObserver(0.5)
    // PropertyCard rendered for the first time should not have initialized carousel,
    // as it greatly impacts performance on the first render of the grid (24+ cards).
    // CardGallery with only one image passed would simply display the image,
    // without interaction controls and Embla ribbon.
    const [carouselActive, setCarouselActive] = useState(false)
    // the image to be displayed before the carousel is activated
    const firstImage = [images[start]]
    images = carouselActive ? images : firstImage
    // map cards should only show the first image
    if (sizeMap || blurred) images = firstImage

    const [hovered, setHovered] = useState(false)
    const [carouselRef, carouselApi] = useEmblaCarousel({
      loop: true,
      startIndex: start
      // duration: 15,
      // dragThreshold: 5,
    })

    const handlePrevClick = useCallback(() => {
      carouselApi?.scrollPrev()
    }, [carouselApi])

    const handleNextClick = useCallback(() => {
      carouselApi?.scrollNext()
    }, [carouselApi])

    const handleMouseEnter = () => {
      onMouseEnter?.()
      if (!carouselActive) setCarouselActive(true)
      if (!mobile) setHovered(true)
    }

    const handleMouseLeave = () => {
      onMouseLeave?.()
      if (!mobile) setHovered(false)
    }

    // touch devices should activate the carousel when they become fully visible on the screen
    const touchDevice = mobile || tablet
    useEffect(() => {
      if (touchDevice && visible) {
        setCarouselActive(true)
      }
    }, [touchDevice, visible])

    useEffect(() => {
      carouselApi?.on('settle', (api) => {
        onChange?.(api.selectedScrollSnap())
      })
    }, [carouselApi])

    useEffect(() => {
      carouselApi?.scrollTo(start)
    }, [start])

    useEffect(() => {
      return () => carouselApi?.destroy()
    }, [])

    return (
      <Box
        ref={containerRef}
        sx={{
          ...(sizeDrawer
            ? {
                height: 260
              } // 260px is the height of the drawer card
            : {
                aspectRatio: 3 / 2
              }),
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-x'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {images ? (
          images.length > 1 ? (
            <>
              <Box ref={carouselRef} sx={{ height: '100%' /* embla-ref */ }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    willChange: 'transform' /* embla-container */
                  }}
                >
                  {images.map((image, index) => (
                    <ImageContainer
                      key={image}
                      src={image}
                      icon={icon}
                      index={index}
                      loading={loading}
                      size={cdnImageSize}
                      score={scores?.[index]}
                    />
                  ))}
                </Box>
              </Box>
              <GalleryControls
                size={28}
                show={hovered}
                onNext={handleNextClick}
                onPrev={handlePrevClick}
              />
            </>
          ) : (
            <ImageContainer
              icon={icon}
              src={images[0]}
              blurred={blurred}
              blurVariant={blurVariant}
              size={cdnImageSize}
            />
          )
        ) : (
          <ImagePlaceholder icon={icon} />
        )}
      </Box>
    )
  }
)

Gallery.displayName = 'Gallery'

export default Gallery
