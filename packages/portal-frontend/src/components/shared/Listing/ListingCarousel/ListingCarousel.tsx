'use client'

import React, { useMemo, useState } from 'react'

import gridConfig from '@configs/cards-grids'
import { Carousel } from '@shared/Carousel'
import { CardSurface, ListingCard } from '@shared/Listing'

import { type ApiListing } from 'services/API'

import { CarouselSkeleton } from './components'

type ListingCarouselProps = {
  title?: string | React.ReactNode
  subtitle?: string
  loop?: boolean
  size?: 'small' | 'medium' | 'large'
  openInNewTab?: boolean
  centering?: boolean
  listings: ApiListing[]
  onCardClick?: (e: React.MouseEvent, index: number) => void
}

const { cardCarouselSpacing, smallCardCarouselSpacing, listingCardSizes } =
  gridConfig

export const ListingCarousel = ({
  title,
  subtitle,
  loop = true,
  size = 'medium',
  openInNewTab,
  listings,
  centering = false,
  onCardClick
}: ListingCarouselProps) => {
  const [galleryHovered, setGalleryHovered] = useState(false)

  const sizeSmall = size === 'small'
  const spacing = sizeSmall ? smallCardCarouselSpacing : cardCarouselSpacing

  // Slides configuration
  const cardCarouselSlides = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: gridConfig.desktopCarouselColumns[size]
  }

  // Card width from config
  const cardWidth = Number(listingCardSizes[size].width)

  // Prepare items - map listings to ListingCard components
  const items = useMemo(
    () =>
      listings.map((listing, index) => (
        <ListingCard
          key={`${listing.mlsNumber}-${index}`}
          size={size}
          listing={listing}
          openInNewTab={openInNewTab}
          onClick={(e) => onCardClick?.(e, index)}
          onGalleryEnter={() => setGalleryHovered(true)}
          onGalleryLeave={() => setGalleryHovered(false)}
        />
      )),
    [listings, size, openInNewTab, onCardClick]
  )

  const emptyState = <CarouselSkeleton size={size} />

  return (
    <CardSurface surface="carousel">
      <Carousel
        loop={loop}
        size={size}
        items={items}
        title={title}
        subtitle={subtitle}
        spacing={spacing}
        cardWidth={cardWidth}
        slidesConfig={cardCarouselSlides}
        watchDrag={!galleryHovered}
        emptyState={emptyState}
        centering={centering}
      />
    </CardSurface>
  )
}
