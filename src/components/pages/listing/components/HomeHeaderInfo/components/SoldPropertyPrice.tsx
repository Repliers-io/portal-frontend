import { Stack, Typography } from '@mui/material'

import { ScrubbedPrice } from 'components/atoms'

import { type Property } from 'services/API'

import { PriceDifference } from '.'

const SoldPropertyPrice = ({ property }: { property: Property }) => {
  const { listPrice, soldPrice } = property

  return (
    <Stack>
      <Typography variant="h2">
        <span>Sold: </span>
        <ScrubbedPrice value={soldPrice} />
      </Typography>
      {Boolean(Number(soldPrice) && listPrice) && (
        <PriceDifference before={listPrice} after={soldPrice} label="ask" />
      )}
    </Stack>
  )
}

export default SoldPropertyPrice
