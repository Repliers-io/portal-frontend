import React from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

const { mapTopOffset } = gridConfig

export const GridMobileDrawer = ({
  show = false,
  children
}: {
  show: boolean
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        pt: { xs: 5.75, sm: 0 },
        top: mapTopOffset,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 'modal',
        position: 'fixed',
        borderTop: { sm: 1 },
        borderColor: { sm: 'background.default' },
        bgcolor: 'background.paper',
        flexDirection: 'column',
        display: { xs: show ? 'flex' : 'none', md: 'none' },
        overflow: 'hidden'
      }}
    >
      {children}
    </Box>
  )
}
