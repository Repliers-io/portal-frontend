import React from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import { ContentShadow } from 'components/atoms'

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
      {/* the whole panel scrolls, starting below the FloatingLayoutSwitch */}
      <Box
        sx={{
          pt: { xs: 6.75, sm: 0 },
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin'
        }}
      >
        {children}
      </Box>
      {/* after the content, so the band also lies over the absolute chat panel */}
      <ContentShadow visible sx={{ top: 0 }} />
    </Box>
  )
}
