import React from 'react'

import { Box } from '@mui/material'

const GridMobileDrawer = ({
  show = false,
  children
}: {
  show: boolean
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 368,
        boxShadow: 1,
        zIndex: 'drawer',
        position: 'absolute',
        bgcolor: 'background.paper',
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: 'column',
        display: { xs: 'flex', md: 'none' },
        willChange: 'transform',
        transition: 'transform 0.3s ease-in-out',
        transform: show ? 'translateY(0)' : 'translateY(105%)'
      }}
    >
      {children}
    </Box>
  )
}

export default GridMobileDrawer
