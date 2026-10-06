import React from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import { useMapOptions } from 'providers/MapOptionsProvider'

const { gridSideContainerWidth } = gridConfig

export const GridDesktopContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { layout } = useMapOptions()
  const gridLayout = layout === 'grid'

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
        maxWidth: gridLayout ? '100%' : gridSideContainerWidth,
        '& .MuiPaper-root': {
          boxShadow: 1
        }
      }}
    >
      {children}
    </Box>
  )
}
