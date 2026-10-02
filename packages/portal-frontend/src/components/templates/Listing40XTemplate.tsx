import React from 'react'

import { Typography } from '@mui/material'

import { ListingCarousel } from '@shared/Listing'

import { FullscreenView } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatFullAddress, parseSeoUrl } from 'utils/listings'

import { useListingError } from './utils'
import { PageTemplate } from '.'

export const Listing40XTemplate = ({
  listingName,
  listings = [],
  error
}: {
  listingName: string
  listings?: ApiListing[]
  error?: unknown
}) => {
  const { status, subtitle } = useListingError(error)

  const parsedAddress = parseSeoUrl(listingName)
  const restoredAddress = formatFullAddress(parsedAddress)
  const showNearbies = listings.length > 0

  return (
    <PageTemplate bgcolor="background.default">
      <FullscreenView title={String(status)} subtitle={subtitle}>
        {showNearbies && (
          <>
            <Typography>
              Fortunately, we have other active listings near
              <br />
              <b>{restoredAddress}</b>
              <br /> Check them out!
            </Typography>
            <ListingCarousel listings={listings} centering={true} />
          </>
        )}
      </FullscreenView>
    </PageTemplate>
  )
}
