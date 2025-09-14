import {
  MenuItem,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

import { type ListingStatus } from '@configs/filters'

import Select from 'components/atoms/PatchedSelect'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

const items: Record<ListingStatus, string> = {
  active: 'For Sale',
  sold: 'Sold',
  all: 'Both',
  rent: 'For Rent'
} as const

const entries = Object.entries(items) as Array<[ListingStatus, string]>

const ListingStatusSelect = ({
  size,
  value,
  variant = 'select',
  onChange
}: {
  size: 'medium' | 'small'
  variant?: 'group' | 'select'
  value: ListingStatus
  onChange: (newValue: ListingStatus) => void
}) => {
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()
  // const mediaQuery = '@media (min-width: 2058px)'

  const handleChange = (e: any) => {
    const value = e.target.value as ListingStatus
    onChange?.(value)
  }

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width:
            variant === 'group' && !mobile
              ? { xs: 110, sm: 313, md: 377, lg: 441 }
              : { xs: 110, sm: 124 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  if (variant === 'group' && !mobile) {
    return (
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        sx={{
          // display: 'none',
          // [mediaQuery]: { display: 'block' },
          width: { sm: 313, md: 377, lg: 441 },
          '& .MuiToggleButton-root': { px: { md: 3, lg: 4 } }
        }}
      >
        {entries.map(([key, label]) => (
          <ToggleButton key={key} value={key} sx={{ whiteSpace: 'nowrap' }}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    )
  }

  return (
    <Select
      size={size}
      value={value}
      variant="filled"
      onChange={handleChange}
      sx={{
        width: { xs: 110, sm: 124 }
      }}
    >
      {entries.map(([key, label]) => (
        <MenuItem key={key} value={key}>
          {label}
        </MenuItem>
      ))}
    </Select>
  )
}

export default ListingStatusSelect
