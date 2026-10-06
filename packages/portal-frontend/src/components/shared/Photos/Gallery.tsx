'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { Box } from '@mui/material'

import { type ListingCardSize } from '@configs/cards-grids'

import { type ImagePlaceholderIconType } from 'components/atoms'

import useBreakpoints from 'hooks/useBreakpoints'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { useWheelNavigation } from 'hooks/useWheelNavigation'

import { GalleryContainer, GalleryControls, ImageContainer } from '.'

type GalleryProps = {
  images: string[]
  scores?: number[]
  blurred?: boolean
  size: ListingCardSize
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onChange?: (index: number) => void
  start?: number
  icon?: ImagePlaceholderIconType
  loading?: 'lazy' | 'eager'
}

export const Gallery = React.memo(
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
    const sizeMap = size === 'small'
    const blurVariant = sizeMap ? 'map' : 'card'

    const { mobile, tablet } = useBreakpoints()
    const [visible, containerRef] = useIntersectionObserver(0.5)
    // ListingCard rendered for the first time should not have initialized carousel,
    // as it greatly impacts performance on the first render of the grid (24+ cards).
    // Until it is activated only the start image is mounted — but inside the very same
    // markup the carousel uses, so activation keeps that <img> node alive instead of
    // remounting it and blinking through the placeholder underneath.
    const [carouselActive, setCarouselActive] = useState(false)
    // map cards and restricted (blurred) cards never turn into a carousel
    const singleImage = sizeMap || blurred || images.length < 2
    // every slide carries its index in the full `images` array, so the start image keeps
    // the same React key — and the same DOM node — once the remaining slides mount
    const slides = carouselActive
      ? images.map((src, index) => ({ src, index }))
      : [{ src: images[start], index: start }]

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

    useWheelNavigation(containerRef, {
      active: carouselActive,
      onPrev: handlePrevClick,
      onNext: handleNextClick
    })

    const handleEnter = () => {
      // no need to handle mouse/touch events for single image
      if (sizeMap) return

      onMouseEnter?.()
      if (!mobile) setHovered(true)
      if (!singleImage) setCarouselActive(true)
    }

    const handleLeave = () => {
      // no need to handle mouse/touch events for single image
      if (sizeMap) return

      onMouseLeave?.()
      if (!mobile) setHovered(false)
    }

    // touch devices should activate the carousel when they become fully visible on the screen
    const touchDevice = mobile || tablet
    useEffect(() => {
      if (touchDevice && visible && !singleImage) {
        setCarouselActive(true)
      }
    }, [touchDevice, visible, singleImage])

    useEffect(() => {
      carouselApi?.on('settle', (api) => {
        onChange?.(api.selectedScrollSnap())
      })
    }, [carouselApi])

    useEffect(() => {
      carouselApi?.scrollTo(start)
    }, [start])

    // Embla positions the ribbon only in its own post-paint effect, so the slides
    // mounted in front of the start image would flash for a frame — hold the offset
    // until Embla takes over with its own inline transform
    const startOffset =
      carouselActive && !carouselApi
        ? `translate3d(-${start * 100}%, 0, 0)`
        : undefined

    return (
      <GalleryContainer
        size={size}
        ref={containerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {singleImage ? (
          <ImageContainer
            icon={icon}
            src={images[start]}
            loading={loading}
            blurred={blurred}
            blurVariant={blurVariant}
          />
        ) : (
          <>
            <Box
              ref={carouselActive ? carouselRef : undefined}
              sx={{ height: '100%' /* embla-ref */ }}
            >
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  transform: startOffset,
                  willChange: 'transform' /* embla-container */
                }}
              >
                {slides.map(({ src, index }) => (
                  <ImageContainer
                    key={`${src}-${index}`}
                    src={src}
                    icon={icon}
                    index={index}
                    loading={loading}
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
        )}
      </GalleryContainer>
    )
  }
)

Gallery.displayName = 'Gallery'
