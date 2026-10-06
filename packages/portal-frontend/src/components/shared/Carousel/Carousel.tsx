'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import { CarouselContainer, CarouselHeader } from './components'
import { useCarousel } from './useCarousel'

type ResponsiveSlides = {
  xs: number
  sm: number
  md: number
  lg: number
}

type CarouselProps = {
  title?: string | React.ReactNode
  subtitle?: string
  loop?: boolean
  size?: 'small' | 'medium' | 'large'
  spacing: number
  cardWidth: number
  slidesConfig: ResponsiveSlides
  items: React.ReactNode[]
  emptyState?: React.ReactNode
  watchDrag?: boolean
  centering?: boolean
}

export const Carousel = ({
  title = '',
  subtitle,
  loop = true,
  size = 'medium',
  cardWidth,
  slidesConfig,
  spacing,
  items,
  emptyState,
  watchDrag = true,
  centering = true
}: CarouselProps) => {
  const {
    carouselRef,
    carouselWidth,
    activateCarousel,
    handlePrevClick,
    handleNextClick
  } = useCarousel({
    items,
    slidesConfig,
    cardWidth,
    spacing,
    loop,
    watchDrag,
    size
  })
  const t = useTranslations('Carousel')

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: carouselWidth },
        display: { xs: 'block', lg: 'inline-block' }
      }}
    >
      {title && (
        <CarouselHeader
          size={size}
          title={title}
          subtitle={subtitle}
          navigation={activateCarousel}
          onPrev={handlePrevClick}
          onNext={handleNextClick}
        />
      )}
      <CarouselContainer spacing={spacing}>
        {!items.length ? (
          emptyState || (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              {t('noItems')}
            </Box>
          )
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ overflow: 'hidden' }} ref={carouselRef}>
              <Box
                sx={{
                  display: 'flex',
                  willChange: 'transform',
                  ...(!activateCarousel && centering
                    ? { justifyContent: 'center' }
                    : {})
                }}
              >
                {items.map((item, index) => (
                  <Box
                    key={index}
                    py={spacing}
                    px={spacing / 2}
                    boxSizing="border-box"
                  >
                    {item}
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
