import React from 'react'

import { Box, Stack } from '@mui/material'

import mapConfig from '@configs/map'
import { controlsRowClearance } from '@shared/Map'

export const SunriseSliderContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const {
    controls: { position }
  } = mapConfig

  const [leftSideFlex, rightSideFlex] = position.includes('top')
    ? ['0', '0'] // squish both sides
    : position.includes('right')
      ? ['0 1 340px', '0 0 340px'] // `bottom-right` or
      : ['0 0 340px', '0 1 340px'] // `bottom-left`

  // on phones the row of map controls holds the bottom edge: the sliders centre above it
  const left = { xs: '0', sm: leftSideFlex }
  const right = { xs: '0', sm: rightSideFlex }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        left: 16,
        right: 16,
        bottom: { xs: controlsRowClearance, sm: 16 },
        zIndex: 'fab',
        position: 'absolute',
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      <Box sx={{ flex: left }} />
      <Stack
        spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          flex: 1,
          '& > *': {
            pointerEvents: 'auto'
          }
        }}
      >
        {children}
      </Stack>
      <Box sx={{ flex: right }} />
    </Stack>
  )
}
