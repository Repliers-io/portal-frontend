import React from 'react'

import { Box } from '@mui/material'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { gridSideContainerWidth } from '../constants'

const GridDesktopContainer = ({ children }: { children: React.ReactNode }) => {
  const { layout } = useMapOptions()

  return (
    <Box
      sx={{
        pt: 0.5,
        mt: { xs: 0.5, md: -1 },
        bgcolor: 'background.paper',
        zIndex: 'drawer',
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: 'column',
        boxSizing: 'border-box',
        willChange: 'width, flex-grow, flex-shrink',
        // transition: 'width 0.5s ease-out',
        width: '100%',
        height: { xs: '100%', md: 'calc(100% + 8px)' },
        maxWidth: layout === 'grid' ? '100%' : gridSideContainerWidth,
        '& .MuiPaper-root': {
          boxShadow: 1
        }
      }}
    >
      {children}
    </Box>
  )
}

export default GridDesktopContainer
