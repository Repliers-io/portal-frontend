'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import { type Post } from 'services/CMS'
import useResponsiveValue from 'hooks/useResponsiveValue'

import { ReviewCard } from './components'
import { Carousel } from '.'

type ReviewsCarouselProps = {
  title?: string | React.ReactNode
  subtitle?: string
  reviews: Post[]
}

const reviewSlidesConfig = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3
}

export const ReviewsCarousel = ({
  title = '',
  subtitle = '',
  reviews
}: ReviewsCarouselProps) => {
  const t = useTranslations('Carousel')

  const reviewCardWidth =
    useResponsiveValue({
      xs: 358,
      sm: 389
    }) || 389

  const items = reviews.map((review) => (
    <ReviewCard key={review.id} review={review} />
  ))

  const emptyState = (
    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
      {t('noReviews')}
    </Box>
  )

  return (
    <Box mb={-4} mt={!title ? -4 : 0}>
      <Carousel
        size="medium"
        title={title}
        subtitle={subtitle}
        cardWidth={reviewCardWidth}
        slidesConfig={reviewSlidesConfig}
        spacing={gridConfig.cardCarouselSpacing}
        emptyState={emptyState}
        items={items}
      />
    </Box>
  )
}
