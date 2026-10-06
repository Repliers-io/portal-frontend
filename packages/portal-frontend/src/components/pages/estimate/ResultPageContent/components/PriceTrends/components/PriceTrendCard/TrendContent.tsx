import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

import { DollarIcon } from '@configs/icons'

import { formatPercentage } from 'utils/formatters'

type TrendContentProps = {
  title: string
  value: number | false
  currencyColor: string
}

export const TrendContent = ({
  title,
  value,
  currencyColor
}: TrendContentProps) => (
  <Stack spacing={1} direction="row" alignItems="stretch" width="100%" py={2}>
    <Box display="flex" alignItems="center" gap={2.5} flex="1" pl={3.5} py={2}>
      <DollarIcon color={currencyColor} />
      <Typography variant="h4">{title}</Typography>
    </Box>
    <Box
      pl={{ xs: 1, md: 2 }}
      pr={{ xs: 2, md: 4 }}
      boxSizing="border-box"
      justifyContent="flex-end"
      display="flex"
      alignItems="center"
    >
      {value !== false ? (
        <Typography variant="h2">
          {formatPercentage(value.toFixed(1))}
        </Typography>
      ) : (
        <Typography variant="h2">No data</Typography>
      )}
    </Box>
  </Stack>
)
