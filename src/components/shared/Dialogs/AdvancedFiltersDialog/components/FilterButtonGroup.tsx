import React from 'react'

import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'

const defaultItems: [string, number][] = [
  ['Any', 0],
  ['1+', 1],
  ['2+', 2],
  ['3+', 3],
  ['4+', 4],
  ['5+', 5]
]

const FilterButtonGroup = ({
  label = 'Group',
  value,
  name,
  onChange,
  items = defaultItems
}: {
  label: string
  value: number | string
  name: string
  onChange: (filters: Filters) => void
  items?: [string, number][]
}) => {
  const handleChange = (_e: React.MouseEvent<HTMLElement>, value: string) => {
    onChange({ [name]: toSafeNumber(value) })
  }

  return (
    <Box>
      <SelectLabel>{label}</SelectLabel>
      <ToggleButtonGroup
        exclusive
        value={toSafeNumber(value)}
        onChange={handleChange}
        sx={{
          width: '100%',
          '& .MuiToggleButton-root': { flex: 1, fontWeight: 400 }
        }}
      >
        {items.map(([label, v], index) => {
          return (
            <ToggleButton key={index} value={v}>
              {label}
            </ToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </Box>
  )
}

export default FilterButtonGroup
