import { Stack, Typography } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatShortAddress } from 'utils/listings'
import { joinNonEmpty } from 'utils/strings'

export const FullAddressInfo = ({ listing }: { listing: ApiListing }) => {
  const { address } = listing

  const { city, neighborhood, area, state, zip } = address
  const localAddress = formatShortAddress(address)

  const cityLevelAddress = joinNonEmpty([localAddress, neighborhood], ', ')

  const stateLevelAddress = joinNonEmpty([city, area, state, zip], ', ')

  return (
    <Typography component="div">
      <Stack>
        <ScrubbedText>{cityLevelAddress},</ScrubbedText>
        <ScrubbedText replace="*****">{stateLevelAddress}</ScrubbedText>
      </Stack>
    </Typography>
  )
}
