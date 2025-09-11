import React from 'react'

import { Box } from '@mui/material'

// import { useMapOptions } from 'providers/MapOptionsProvider'

const MapTransitionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  // const { gridLayout } = useMapOptions()

  return (
    <Box
      sx={{
        flexGrow: 1,
        position: 'relative'
        // willChange: 'transform',
        // transition: 'transform 0.5s ease-out',
        // transform: gridLayout ? 'translateX(-100%)' : 'none'
      }}
    >
      {children}
    </Box>
  )
}

export default MapTransitionContainer
