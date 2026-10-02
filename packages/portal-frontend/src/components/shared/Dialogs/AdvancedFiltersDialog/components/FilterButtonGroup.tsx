import React from 'react'

import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { SelectLabel } from 'components/atoms'

import { type Filters } from 'services/Search'

const defaultItems: [string, number | string | boolean][] = [
  ['Any', 0],
  ['1+', 1],
  ['2+', 2],
  ['3+', 3],
  ['4+', 4],
  ['5+', 5]
]

export const FilterButtonGroup = ({
  name,
  label = '',
  value,
  onChange,
  items = defaultItems
}: {
  label?: string
  value: number | string | boolean | undefined
  name: string
  onChange: (filters: Partial<Filters>) => void
  items?: [string, number | string | boolean][]
}) => {
  const handleChange = (_e: React.MouseEvent<HTMLElement>, next: unknown) => {
    onChange({ [name]: next ?? false })
  }

  return (
    <Box>
      {label && <SelectLabel>{label}</SelectLabel>}
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        sx={{
          width: '100%',
          '& .MuiToggleButton-root': {
            flex: 1,
            fontWeight: 400
          }
        }}
      >
        {items.map(([itemLabel, v], index) => (
          <ToggleButton key={index} value={v}>
            {itemLabel}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
