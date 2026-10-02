/**
 * Listing detail (PDP) template: mounts the section's scoped providers
 * (SearchProvider → ListingProvider → ListingDetailsProvider → LiveByDemographicsProvider)
 * around ListingPageContent.
 * Anatomy: docs → product-guide/listing-detail/technical.
 */
'use client'

import React from 'react'

import { Box } from '@mui/material'

import ListingPageContent from '@pages/listing'

import { type ApiListing, type LiveByDemographicsLocation } from 'services/API'
import ListingDetailsProvider from 'providers/ListingDetailsProvider'
import ListingProvider from 'providers/ListingProvider'
import { LiveByDemographicsProvider } from 'providers/LiveByDemographicsProvider'
import SearchProvider from 'providers/SearchProvider'

type ListingPageTemplateProps = {
  listing: ApiListing
  demographics: LiveByDemographicsLocation | null
}

export const ListingPageTemplate = ({
  listing,
  demographics
}: ListingPageTemplateProps) => (
  <SearchProvider>
    <ListingProvider listing={listing}>
      <ListingDetailsProvider listing={listing}>
        <LiveByDemographicsProvider demographics={demographics}>
          <Box
            sx={{
              width: '100%',
              pt: { xs: 0, sm: 2 }
            }}
          >
            <ListingPageContent />
          </Box>
        </LiveByDemographicsProvider>
      </ListingDetailsProvider>
    </ListingProvider>
  </SearchProvider>
)
