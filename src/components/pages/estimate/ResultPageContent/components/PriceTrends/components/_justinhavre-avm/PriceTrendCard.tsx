import React from 'react'

import { Box, Paper, Stack, Typography } from '@mui/material'

import { formatPercentage } from 'utils/formatters'

interface ChangeItemProps {
  value: number | false
  title: string
  color?: 'primary' | 'secondary'
}
const PriceTrend = ({ title, value }: ChangeItemProps) => {
  return (
    <Paper
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        alignItems: 'center'
      }}
    >
      <Stack
        spacing={1}
        width="100%"
        direction="row"
        justifyContent="space-between"
      >
        <Box pl={{ xs: 3, md: 4 }} py={{ xs: 3, md: 4 }}>
          <Typography variant="h4">{title}</Typography>
        </Box>
        <Box
          pr={{ xs: 3, md: 4 }}
          boxSizing="border-box"
          justifyContent="flex-end"
          display="flex"
          alignItems="center"
        >
          {value !== false ? (
            <Typography variant="h2" fontWeight={600}>
              {formatPercentage(value.toFixed(1))}
            </Typography>
          ) : (
            <Typography variant="h2">No data</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default PriceTrend
