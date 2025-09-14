import type React from 'react'

import { Stack } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'

const FormLayoutNavigation = ({ children }: { children: React.ReactNode }) => {
  const { calculating } = useEstimate()
  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        width: '100%',
        maxWidth: { xs: '100%', md: 360 },
        minHeight: {
          xs: 'calc(100svh - 104px)',
          sm: 'calc(100svh - 152px)',
          md: 0
        },
        overflow: 'hidden',
        ...(calculating && { opacity: 0.5, pointerEvents: 'none' })
      }}
    >
      {children}
    </Stack>
  )
}

export default FormLayoutNavigation
