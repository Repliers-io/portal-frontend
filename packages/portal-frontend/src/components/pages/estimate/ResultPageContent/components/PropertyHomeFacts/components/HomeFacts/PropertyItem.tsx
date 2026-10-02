import React, { type JSX } from 'react'

import { Chip, List, ListItem, Typography } from '@mui/material'

import type { Primitive } from 'utils/formatters'
import { capitalize } from 'utils/strings'

const validDate = (value: unknown) => {
  return typeof value === 'string' && !isNaN(Date.parse(value))
}

const multivalue = (value: unknown) => {
  if (validDate(value)) return false // skip rendering dates as multivalue(comma separated values with a chip component)
  return (
    Array.isArray(value) || (typeof value === 'string' && value.includes(', '))
  )
}

// transform value to different JSX components based on a value type
const valueAdapter = {
  list(value: string | string[]) {
    const items =
      typeof value === 'string' ? value.split(', ') : (value as string[])

    return items.map((item, index) => (
      <Chip
        key={index}
        label={capitalize(String(item))}
        sx={{ borderRadius: 1, fontWeight: 600 }}
      />
    ))
  },
  single(value: Primitive) {
    return (
      <Typography variant="body1" fontWeight={600}>
        {capitalize(String(value))}
      </Typography>
    )
  }
}

const renderValue = (value: Primitive): JSX.Element | JSX.Element[] => {
  if (multivalue(value)) {
    return valueAdapter.list(value as string | string[])
  }
  return valueAdapter.single(value)
}

interface PropertyItemProps {
  label: string
  value: Primitive
}

const PropertyItem: React.FC<PropertyItemProps> = ({ label, value }) => {
  const lengthyValue = String(value).length > 25
  const multivalueProperty = multivalue(value)

  return (
    <List
      sx={{
        py: 0,
        my: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        breakInside: 'avoid',
        '& li': { my: 0, py: 0.75, px: 0 }
      }}
    >
      <ListItem sx={{ flex: '0 0 70%' }}>
        <Typography variant="body1">
          {`${label}${multivalueProperty ? ':' : ''}`}
        </Typography>
      </ListItem>
      <ListItem
        sx={{
          flex: lengthyValue || multivalueProperty ? '0 0 100%' : '0 0 30%',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {renderValue(value)}
      </ListItem>
    </List>
  )
}

export default PropertyItem
