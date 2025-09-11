import React from 'react'

import { Paper, Stack } from '@mui/material'

const PriceTrendsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Paper
      sx={{
        p: 3,
        pr: 2,
        overflow: 'visible',
        boxSizing: 'border-box'
      }}
    >
      <Stack spacing={2} sx={{ height: '100%', flex: 1 }}>
        {children}
      </Stack>
    </Paper>
  )
}

export default PriceTrendsContainer
