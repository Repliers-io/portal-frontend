import { Stack, Typography } from '@mui/material'

import listingsConfig from '@configs/listings'

import { ScrubbedPrice } from 'components/atoms'

import { type ApiListing } from 'services/API'

import { PriceDifference } from '.'

export const SoldPropertyPrice = ({ listing }: { listing: ApiListing }) => {
  const { listPrice, soldPrice, lastStatus } = listing

  return (
    <Stack>
      <Typography variant="h2" lineHeight={1}>
        <span>{listingsConfig.statusLabels[lastStatus]}: </span>
        <ScrubbedPrice value={soldPrice} />
      </Typography>
      {Boolean(Number(soldPrice) && listPrice) && (
        <PriceDifference before={listPrice} after={soldPrice} label="ask" />
      )}
    </Stack>
  )
}
