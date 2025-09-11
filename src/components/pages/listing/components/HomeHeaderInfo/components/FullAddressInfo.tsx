import { Stack, Typography } from '@mui/material'

import ScrubbedText from 'components/atoms/ScrubbedText'

import { type Property } from 'services/API'
import { formatShortAddress } from 'utils/properties'
import { joinNonEmpty } from 'utils/strings'

const FullAddressInfo = ({ property }: { property: Property }) => {
  const { address } = property

  const { city, neighborhood, area, state, zip } = address
  const localAddress = formatShortAddress(address)

  const cityLevelAddress = joinNonEmpty([localAddress, city], ', ')

  const stateLevelAddress = joinNonEmpty([area, neighborhood, state, zip], ', ')

  return (
    <Typography component="div">
      <Stack>
        <ScrubbedText>{cityLevelAddress},</ScrubbedText>
        <ScrubbedText replace="*****">{stateLevelAddress}</ScrubbedText>
      </Stack>
    </Typography>
  )
}

export default FullAddressInfo
