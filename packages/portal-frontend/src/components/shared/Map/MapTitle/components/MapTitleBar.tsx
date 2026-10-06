import React from 'react'

import { Box, IconButton, Stack } from '@mui/material'

import { CloseIcon } from '@configs/icons'
import { useLocationSelection } from '@shared/Map/hooks'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

export const MapTitleBar = ({
  visible,
  children
}: {
  visible: boolean
  children: React.ReactNode
}) => {
  const { clearEditMode } = useMapOptions()
  const { clearSelection } = useLocationSelection()
  const { clearPolygon, removeFilters, clearPoint } = useSearch()

  const handleClose = () => {
    clearPolygon()
    clearEditMode()
    clearSelection()
    clearPoint()
    removeFilters(['source', 'slug'])
  }

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        overflow: 'hidden',
        position: 'absolute',
        // Chrome sits above markers (like the controls' `fab`); a hovered/active
        // marker is raised to z-index 1000 in MapContainer and would otherwise
        // paint over the title bar.
        zIndex: 'fab',
        display: { xs: 'none', sm: 'block' },
        // The container is just a clip frame for the shadow and slide animation —
        // it must not hit-test, or its empty shadow strip would steal mouse
        // events from the map before the cursor reaches the title bar itself.
        pointerEvents: 'none'
      }}
    >
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 0.5,
          height: 40,
          boxShadow: 1,
          bgcolor: '#FFFA',
          backdropFilter: 'blur(6px)',
          // Only the title bar itself is interactive.
          pointerEvents: visible ? 'auto' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? '' : 'translateY(-100%)',
          transition: 'opacity 0.15s ease, transform 0.15s ease'
        }}
      >
        <Stack
          spacing={1}
          width="100%"
          minHeight={40}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{ minWidth: 0, overflow: 'hidden', flex: 1, height: 40 }}
          >
            {children}
          </Stack>

          <IconButton
            sx={{ color: 'common.black', flexShrink: 0 }}
            onClick={handleClose}
          >
            <CloseIcon sx={{ width: '24px', height: '24px' }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  )
}
