import CloseIcon from '@mui/icons-material/Close'
import {
  IconButton,
  type InputBaseComponentProps,
  Stack,
  TextField
} from '@mui/material'

import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'

const PriceSelect = ({
  min,
  max,
  onChange
}: {
  min?: number | null
  max?: number | null
  onChange: (filters: Filters) => void
}) => {
  const handleMinChange = (e: any) => {
    const { value } = e.target
    onChange({ minPrice: toSafeNumber(value) })
  }

  const handleMaxChange = (e: any) => {
    const { value } = e.target
    onChange({ maxPrice: toSafeNumber(value) })
  }

  const clearMin = () => onChange({ minPrice: 0 })
  const clearMax = () => onChange({ maxPrice: 0 })

  const inputProps: InputBaseComponentProps = {
    inputMode: 'numeric',
    maxLength: 7,
    min: 0,
    max: 90000000
  }

  return (
    <Stack direction="row" spacing={4}>
      <TextField
        sx={{ flex: 1 }}
        placeholder="Any"
        value={!min ? '' : min}
        onChange={handleMinChange}
        slotProps={{
          input: {
            inputProps,
            endAdornment: min ? (
              <IconButton sx={{ mr: -1 }} onClick={clearMin}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        }}
      />
      <TextField
        sx={{ flex: 1 }}
        placeholder="Any"
        value={!max ? '' : max}
        onChange={handleMaxChange}
        slotProps={{
          input: {
            inputProps,
            endAdornment: max ? (
              <IconButton sx={{ mr: -1 }} onClick={clearMax}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        }}
      />
    </Stack>
  )
}

export default PriceSelect
