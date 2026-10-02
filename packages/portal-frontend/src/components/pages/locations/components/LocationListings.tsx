'use client'

import searchConfig from '@configs/search'
import { EmptyCatalogListings } from '@shared/EmptyStates'
import { CardSurface, ListingCard, SkeletonCard } from '@shared/Listing'

import { useLocationPage } from 'providers/LocationProvider'

// The catalog's card grid — the seam tenants fork to swap the grid layout.
export const LocationListings = ({ loading }: { loading?: boolean }) => {
  const { listings } = useLocationPage()

  if (!loading && !listings.length) return <EmptyCatalogListings />

  return (
    <CardSurface surface="locations" variant="grid">
      {loading
        ? Array.from({ length: searchConfig.pageSize }, (_, index) => (
            <SkeletonCard key={index} />
          ))
        : listings.map((listing, index) => (
            <ListingCard key={index} listing={listing} />
          ))}
    </CardSurface>
  )
}
