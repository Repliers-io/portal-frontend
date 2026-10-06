'use client'

import { Box, Paper, Stack } from '@mui/material'

import features from '@configs/features'
import listingsConfig from '@configs/listings'
import { FavoritesButton, ListingShareButton } from '@pages/listing/components'

import { useListing } from 'providers/ListingProvider'
import { pending, sold, soldOrRented } from 'utils/listings'

import {
  EstimatedPropertyPrice,
  FullAddressInfo,
  ImageInsights,
  ListedPropertyPrice,
  ListingIcons,
  ListPropertyPrice,
  MlsInfo,
  OffMarketPropertyPrice,
  ShowcaseCards,
  SoldPropertyPrice
} from './components'

export const HomeHeaderInfo = () => {
  const { listing, blurred } = useListing()
  const { listPrice, estimate } = listing
  // Only a firm sale/lease (Sld/Lsd) shows the sold-price block. Other off-market
  // listings (terminated/expired/suspended, or a guest-redacted status) have no
  // sold price — a fabricated "Sold: —" would misstate their status.
  const closed = soldOrRented(listing)
  // pending (conditional) listings are not firm sales — show them like active
  // listings (list price, no strikethrough), not with an off-market block
  const offMarket = sold(listing) && !pending(listing) && !closed

  const reorderedSx = {
    order: { sm: 3, lg: 2 },
    minWidth: { sm: '100%', lg: 'auto' }
  }

  const { favorites, aiQuality } = features
  const { share, showcaseCards } = listingsConfig.components
  const headerButtons = share || favorites

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          border: 1,
          boxShadow: 0,
          boxSizing: 'border-box',
          borderColor: 'divider',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction="row"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            {closed ? (
              <>
                <SoldPropertyPrice listing={listing} />
                <Box sx={reorderedSx}>
                  <ListedPropertyPrice listing={listing} />
                </Box>
              </>
            ) : offMarket ? (
              <>
                <OffMarketPropertyPrice listing={listing} />
                <Box sx={reorderedSx}>
                  <ListedPropertyPrice listing={listing} />
                </Box>
              </>
            ) : listPrice ? (
              <>
                <ListPropertyPrice listing={listing} />
                {Boolean(estimate?.value) && (
                  <Box sx={reorderedSx}>
                    <EstimatedPropertyPrice listing={listing} />
                  </Box>
                )}
              </>
            ) : (
              ' ' // need at least somethng in markup to push buttons container to the right
            )}

            <Stack
              spacing={2}
              direction={{ xs: 'row', sm: 'column', md: 'row' }}
              alignItems={{
                xs: 'flex-start',
                sm: 'flex-end',
                md: 'flex-start'
              }}
              sx={{
                order: { sm: 2, lg: 3 },
                ...(!headerButtons && {
                  // NOTE: temporary solution until we decide how the empty layout should look
                  pointerEvents: 'none',
                  visibility: 'hidden',
                  opacity: 0
                }),
                mb: { xs: 0, sm: '-72px', md: 0 }
              }}
            >
              {share && <ListingShareButton />}
              {favorites && <FavoritesButton />}
            </Stack>
          </Stack>
          <Stack
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="space-between"
            direction={{ xs: 'column-reverse', sm: 'row' }}
          >
            <FullAddressInfo listing={listing} />
            <ListingIcons listing={listing} />
          </Stack>

          <MlsInfo listing={listing} />

          {aiQuality && (
            <Box pb={1}>
              <ImageInsights />
            </Box>
          )}

          {showcaseCards && !blurred && (
            <ShowcaseCards sx={{ display: { xs: 'none', sm: 'flex' } }} />
          )}
        </Stack>
      </Paper>
      {showcaseCards && !blurred && (
        <ShowcaseCards sx={{ display: { xs: 'flex', sm: 'none' } }} />
      )}
    </Stack>
  )
}
