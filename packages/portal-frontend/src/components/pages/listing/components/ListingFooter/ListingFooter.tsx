'use client'

import React from 'react'

import { Box, Stack } from '@mui/material'

import listingsConfig from '@configs/listings'
import {
  getPropertyClass,
  LocationStatistics
} from '@pages/estimate/Statistics'

import { useListing } from 'providers/ListingProvider'

import {
  FooterContainer,
  FooterDisclaimer,
  SimilarListingCarousel
} from './components'

export const ListingFooter = () => {
  const { similarListings, listing } = useListing()
  const { city, neighborhood } = listing.address || {}
  const propertyClass = getPropertyClass(listing)

  return (
    <FooterContainer>
      {listingsConfig.components.locationStats && (neighborhood || city) && (
        <Box
          sx={{
            pb: 4,
            zIndex: 'fab'
          }}
        >
          <Stack
            spacing={4}
            sx={{
              // Override gap for Stacks that contain Paper components (widget containers)
              '& .widgets-panel, & .location-statistics': {
                gap: { xs: '16px', md: '32px' }
              },
              // Override gap for GraphsPanel
              '& .graphs-panel': {
                gap: { xs: '16px', md: '32px' }
              }
            }}
          >
            {neighborhood && (
              <LocationStatistics
                neighborhood={neighborhood}
                propertyClass={propertyClass}
              />
            )}

            {city && (
              <LocationStatistics city={city} propertyClass={propertyClass} />
            )}
          </Stack>
        </Box>
      )}

      <SimilarListingCarousel listings={similarListings} />

      <FooterDisclaimer />
    </FooterContainer>
  )
}
