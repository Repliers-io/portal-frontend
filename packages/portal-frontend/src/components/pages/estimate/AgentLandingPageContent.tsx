'use client'

import { Box } from '@mui/material'

import { EstimateForm } from '@pages/estimate/EstimateForm'

export const AgentLandingPageContent = () => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 72px)',
        position: 'relative'
      }}
    >
      <EstimateForm />
    </Box>
  )
}
