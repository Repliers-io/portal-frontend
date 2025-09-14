import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Stack, Typography } from '@mui/material'

import ScrubbedText from 'components/atoms/ScrubbedText'

import { type Property } from 'services/API'
import { useSearch } from 'providers/SearchProvider'
import { formatShortAddress } from 'utils/properties'

import { MultiUnitContainer } from '.'

const MultiUnitHeader = ({ count, unit }: { count: any; unit: Property }) => {
  const { clearMultiUnits } = useSearch()

  const handleClearClick = () => {
    clearMultiUnits()
  }
  // hide unit number in address, as we are showing multiple units
  const addressString = formatShortAddress({ ...unit?.address, unitNumber: '' })

  return (
    <MultiUnitContainer>
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
    </MultiUnitContainer>
  )
}

export default MultiUnitHeader
