import { IconButton, Stack, Typography } from '@mui/material'

import { CloseIcon } from '@configs/icons'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { useSearch } from 'providers/SearchProvider'
import { formatShortAddress } from 'utils/listings'

import { GridHeaderContainer } from './GridHeaderContainer'

export const MultiUnitHeader = ({
  count,
  unit
}: {
  count: any
  unit: ApiListing
}) => {
  const { clearMultiUnits } = useSearch()

  const handleClearClick = () => {
    clearMultiUnits()
  }
  // hide unit number in address, as we are showing multiple units
  const addressString = formatShortAddress({ ...unit?.address, unitNumber: '' })

  return (
    <GridHeaderContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.5}>
          <span>
            <Typography fontWeight="600" display="inline">
              {count}
            </Typography>{' '}
            <Typography variant="body2" color="text.hint" display="inline">
              units on
            </Typography>
          </span>
          <Typography variant="h4">
            <ScrubbedText>{addressString}</ScrubbedText>
          </Typography>
        </Stack>
        <IconButton
          size="large"
          sx={{ color: 'common.black' }}
          onClick={handleClearClick}
        >
          <CloseIcon sx={{ width: '24px', height: '24px' }} />
        </IconButton>
      </Stack>
    </GridHeaderContainer>
  )
}
