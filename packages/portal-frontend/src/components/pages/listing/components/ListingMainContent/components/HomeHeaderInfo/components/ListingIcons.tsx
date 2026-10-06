import { Stack, Typography } from '@mui/material'

import { BathIcon, BedIcon, SquareIcon } from '@configs/icons'

import { type ApiListing } from 'services/API'
import {
  getBathrooms,
  getBedrooms,
  getLotSize,
  getSqft,
  land
} from 'utils/listings'

export const ListingIcons = ({ listing }: { listing: ApiListing }) => {
  const { details } = listing

  const sqft = getSqft(listing)
  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const lotSize = getLotSize(listing)

  return (
    <Stack
      direction="row"
      spacing={{ xs: 2, sm: 2, md: 2, lg: 4 }}
      sx={{ pt: { xs: 1, sm: 0 } }}
    >
      {beds.count > 0 && (
        <Stack spacing={1} direction="row" alignItems="center">
          <BedIcon size={40} />
          <Typography variant="h5" color="text.hint">
            {beds.label}
          </Typography>
        </Stack>
      )}
      {baths.count > 0 && (
        <Stack spacing={1} direction="row" alignItems="center">
          <BathIcon size={38} />
          <Typography variant="h5" color="text.hint">
            {baths.label}
          </Typography>
        </Stack>
      )}
      {sqft.number > 0 && (
        <Stack spacing={1} direction="row" alignItems="center">
          <SquareIcon size={32} />
          <Typography variant="h5" color="text.hint" noWrap>
            {sqft.label}
          </Typography>
        </Stack>
      )}
      {lotSize.number > 0 && land(listing) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <SquareIcon size={32} />
          <Typography variant="h5" color="text.hint" noWrap>
            {lotSize.label}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
