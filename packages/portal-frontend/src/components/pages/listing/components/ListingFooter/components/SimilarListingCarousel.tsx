import React from 'react'

import { Box } from '@mui/material'

import listingsConfig from '@configs/listings'
import { ListingCarousel } from '@shared/Listing'

import { type ApiListing } from 'services/API'

export const SimilarListingCarousel = ({
  listings
}: {
  listings: ApiListing[]
}) => {
  if (listings.length === 0) return null

  return (
    <Box>
      <ListingCarousel
        title="Similar properties"
        listings={listings}
        openInNewTab={listingsConfig.linksInNewTab}
      />
    </Box>
  )
}
