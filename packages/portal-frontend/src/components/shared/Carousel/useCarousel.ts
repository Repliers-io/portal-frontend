'use client'

import { useCallback, useEffect, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type React from 'react'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import useResponsiveValue from 'hooks/useResponsiveValue'
import { useWheelNavigation } from 'hooks/useWheelNavigation'

type ResponsiveSlides = {
  xs: number
  sm: number
  md: number
  lg: number
}

type UseCarouselProps = {
  items: React.ReactNode[]
  slidesConfig: ResponsiveSlides
  cardWidth: number
  spacing: number
  loop?: boolean
  watchDrag?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const useCarousel = ({
  items,
  slidesConfig,
  cardWidth,
  spacing,
  loop = true,
  watchDrag = true,
  size = 'medium'
}: UseCarouselProps) => {
  const clientSide = useClientSide()
  const { mobile, wideScreen } = useBreakpoints()

  const slidesToShow = useResponsiveValue(slidesConfig) || slidesConfig.lg
  const sizeSmall = size === 'small'

  const carouselWidth = useMemo(() => {
    if (sizeSmall) return '100%'

    return wideScreen || !clientSide
      ? cardWidth * slidesToShow + spacing * 8 * (slidesToShow - 1)
      : '100%'
  }, [wideScreen, slidesToShow, clientSide, cardWidth, spacing, sizeSmall])

  const activateCarousel = items.length > slidesToShow

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

  // the viewport element, so every Carousel fork gets the gesture without wiring a ref
  useWheelNavigation(carouselApi?.rootNode(), {
    active: activateCarousel,
    onPrev: handlePrevClick,
    onNext: handleNextClick
  })

  useEffect(() => {
    if (carouselApi) {
      carouselApi.reInit({ watchDrag })
    }
  }, [watchDrag, carouselApi])

  useEffect(() => {
    return () => carouselApi?.destroy()
  }, [carouselApi])

  useEffect(() => {
    carouselApi?.scrollTo(0, true)
  }, [items, carouselApi])

  return {
    carouselRef,
    carouselWidth,
    activateCarousel,
    handlePrevClick,
    handleNextClick,
    slidesToShow
  }
}
