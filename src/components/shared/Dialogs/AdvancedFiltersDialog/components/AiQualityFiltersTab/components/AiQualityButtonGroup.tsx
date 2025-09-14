import React, { useMemo } from 'react'

import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { aiQuality } from '@configs/filters'

import SelectLabel from 'components/atoms/SelectLabel'

import { type FilterKeys, type Filters } from 'services/Search'

const AiQualityButtonGroup = ({
  label = 'Quality',
  value: propsValue,
  name,
  onChange,
  items = aiQuality
}: {
  label?: string
  name: FilterKeys
  value: string | string[] | null
  items?: [string, string][]
  onChange: (filters: Filters) => void
}) => {
  const values = useMemo(() => items.map((item) => item[1]), [items])

  const groupValue = useMemo(() => {
    if (Array.isArray(propsValue)) {
      const selected = propsValue.filter((v) => values.includes(v))
      if (selected.length) return selected
    }
    return null
  }, [propsValue, values])

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    selected: string[]
  ) => {
    let result: string | string[] | null = null
    if (selected.length) result = selected
    onChange({ [name]: result })
  }

  return (
    <Box>
      <SelectLabel>{label}</SelectLabel>
      <ToggleButtonGroup
        size="small"
        exclusive={false} // Allows multiple selections
        value={groupValue} // Expects an array
        onChange={handleChange}
        sx={{
          height: 42,
          width: '100%',
          '& .MuiToggleButton-root': {
            flexGrow: 1
          }
        }}
      >
        {items.map(([label, value], index) => {
          return (
            <ToggleButton key={index} value={value} sx={{ px: 0.5 }}>
              {label}
            </ToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </Box>
  )
}

export default AiQualityButtonGroup
