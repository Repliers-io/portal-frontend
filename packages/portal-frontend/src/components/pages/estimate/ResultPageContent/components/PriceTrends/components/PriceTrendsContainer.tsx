import React from 'react'

import { Stack } from '@mui/material'

import { CardPaper } from '@shared/Containers'

const PriceTrendsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <CardPaper
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
    </CardPaper>
  )
}

export default PriceTrendsContainer
