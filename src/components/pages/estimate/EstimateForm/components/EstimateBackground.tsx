import React from 'react'

import { Box, Container } from '@mui/material'

import { EstimateBackgroundShadow } from '.'

const EstimateBackground = ({
  collapsed,
  children
}: {
  collapsed: boolean
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1200,
        position: 'relative',
        ...(!collapsed && {
          zIndex: 1300,
          height: '100vh',
          position: 'fixed'
        })
      }}
    >
      <EstimateBackgroundShadow collapsed={collapsed} />

      <Container
        maxWidth="lg"
        sx={{
          zIndex: 2,
          height: '100%',
          display: 'flex',
          position: 'relative',
          boxSizing: 'border-box',
          alignItems: { xs: 'flex-start', sm: 'center' },
          px: collapsed ? { xs: 0 } : { xs: 0, sm: 2, md: 3 }
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

export default EstimateBackground
