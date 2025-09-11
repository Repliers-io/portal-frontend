import type React from 'react'

import { Stack, Typography } from '@mui/material'

import { formatEnglishPrice } from 'utils/formatters'

const EstimateValue = ({
  size = 'large',
  title = '',
  value
}: {
  size?: 'medium' | 'large'
  title: string
  value: number
}) => {
  return (
    <Stack
      spacing={1}
      width="100%"
      alignItems="baseline"
      direction={size === 'large' ? 'column' : 'row'}
    >
      {Boolean(title) && <Typography>{title}</Typography>}
      <Typography variant="h1" color="secondary.light" lineHeight={1}>
        {formatEnglishPrice(Math.round(value))}
      </Typography>
    </Stack>
  )
}

export default EstimateValue
