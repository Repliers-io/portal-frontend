import React from 'react'

import { Box, type BoxProps } from '@mui/material'

const MapContainer = React.forwardRef<HTMLDivElement, BoxProps>(
  (props, ref) => (
    <Box
      {...props}
      ref={ref}
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: '#e9e6e0',
        overflow: 'hidden',
        position: 'absolute',
        contentVisibility: 'visible',
        '& .active': {
          zIndex: 1000
        },
        '& .mapboxgl-canvas': {
          outline: 'none !important'
        },
        '& .mapboxgl-popup': {
          zIndex: 1000
        },
        '& .mapboxgl-marker:hover': {
          zIndex: 1000
        },
        '& .mapboxgl-popup-content': {
          p: 0,
          boxShadow: 0,
          bgcolor: 'transparent !important'
        },
        '& .mapboxgl-popup-tip': {
          display: 'none !important'
        },
        '& .mapboxgl-ctrl-group': {
          display: { xs: 'none', md: 'block' }
        }
      }}
    />
  )
)

MapContainer.displayName = 'MapContainer'

export default MapContainer
