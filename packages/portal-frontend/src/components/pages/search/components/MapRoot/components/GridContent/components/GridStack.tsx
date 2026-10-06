import React from 'react'

import gridConfig, { type ListingCardSize } from '@configs/cards-grids'
import searchConfig from '@configs/search'
import { EmptyListings } from '@shared/EmptyStates'
import { CardSurface, ListingCard, SkeletonCard } from '@shared/Listing'

import { type ApiListing } from 'services/API'
import { getUniqueKey } from 'utils/listings'

export const GridStack = ({
  page = 1,
  pageSize = searchConfig.pageSize,
  loading = false,
  size = 'medium',
  listings,
  onCardEnter,
  onCardLeave,
  onCardClick
}: {
  page?: number
  pageSize?: number
  loading?: boolean
  size?: ListingCardSize
  listings: ApiListing[]
  onCardEnter?: (mlsNumber: string) => void
  onCardLeave?: () => void
  onCardClick?: (e: React.MouseEvent, listing: ApiListing) => void
}) => {
  // Limit displayed listings to pageSize
  const displayedListings = listings.slice(0, pageSize)
  const cardHeight = Number(gridConfig.listingCardSizes[size].height)

  return (
    <CardSurface
      variant="grid"
      surface="search"
      sx={{
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.2s ease-out',
        minHeight: cardHeight
      }}
    >
      {!page || (!listings.length && loading) ? (
        // `page: 0` is a special state after first initial load, before any searches/saves
        Array.from({ length: pageSize }).map((_v, index) => (
          <SkeletonCard key={index} size={size} />
        ))
      ) : !listings.length && !loading ? (
        <EmptyListings />
      ) : (
        displayedListings.map((listing) => (
          <ListingCard
            size={size}
            listing={listing}
            key={getUniqueKey(listing)}
            onClick={(e) => onCardClick?.(e, listing)}
            onCardEnter={onCardEnter}
            onCardLeave={onCardLeave}
          />
        ))
      )}
    </CardSurface>
  )
}
