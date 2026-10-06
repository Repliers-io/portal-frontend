'use client'

import { Box, Stack, Typography } from '@mui/material'

import type { LiveByScalarMetric } from '../types'

export const ScalarStatistic = ({
  label,
  value
}: Omit<LiveByScalarMetric, 'kind'>) => (
  <Box
    sx={{
      p: 2,
      height: '100%',
      borderRadius: 2,
      boxSizing: 'border-box',
      bgcolor: 'background.default'
    }}
  >
    <Stack spacing={1} justifyContent="space-between" height="100%">
      <Typography variant="body2">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Stack>
  </Box>
)
