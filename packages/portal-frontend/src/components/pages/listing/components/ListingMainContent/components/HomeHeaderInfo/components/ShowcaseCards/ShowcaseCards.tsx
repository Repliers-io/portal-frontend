import React from 'react'

import { Stack, type SxProps, type Theme } from '@mui/material'

import { useListing } from 'providers/ListingProvider'
import useStreetView from 'hooks/useStreetView'
import { displayOnMap, getListingTours } from 'utils/listings'

import { MapCard, StreetViewCard, TourCard } from './components'
import { radius, size } from './constants'

const gap = 2 // theme spacing units (16px)
const streetViewOptions = { size, radius }

export const ShowcaseCards = ({ sx }: { sx?: SxProps<Theme> }) => {
  const { listing } = useListing()
  const listingOnMap = displayOnMap(listing)
  const tours = getListingTours(listing.details)

  // resolved here (not inside StreetViewCard) so the card count matches what
  // actually renders — street view arrives async and may not exist at all.
  const { url: streetViewUrl, thumbnailImage } = useStreetView({
    address: listing.address,
    map: listing.map,
    options: streetViewOptions
  })
  const streetView = listingOnMap && Boolean(streetViewUrl)

  const cardCount = (listingOnMap ? 1 : 0) + (streetView ? 1 : 0) + tours.length

  return (
    <Stack
      useFlexGap
      spacing={gap}
      direction="row"
      // Mobile stacks the full-width cards; on desktop only the 4-card layout
      // wraps (into 2×2) — 1–3 cards stay on a single row.
      flexWrap={{ xs: 'wrap', sm: cardCount === 4 ? 'wrap' : 'nowrap' }}
      sx={{
        // Hide if empty (when all children return null)
        '&:empty': { display: 'none' },
        // 1–2 cards keep their fixed width. 3–4 drop it and stretch to fill the
        // row: 3 → three equal columns, 4 → a 2×2 grid of 50% columns. The
        // flex-basis overrides each card's fixed width; minWidth lets it shrink.
        ...(cardCount >= 3 && {
          '& > *': {
            minWidth: { sm: 0 },
            flex: { sm: cardCount === 4 ? '1 1 calc(50% - 8px)' : '1 1 0' }
          }
        }),
        // last, so a caller's `& > *` replaces the card sizing
        ...sx
      }}
    >
      {tours.map((tour) => (
        <TourCard key={tour.type} url={tour.url} type={tour.type} />
      ))}
      {streetView && (
        <StreetViewCard url={streetViewUrl} thumbnailImage={thumbnailImage} />
      )}
      {listingOnMap && <MapCard />}
    </Stack>
  )
}
