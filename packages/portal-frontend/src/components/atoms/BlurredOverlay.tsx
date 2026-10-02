import React from 'react'

import { Box } from '@mui/material'

import { VisibilityOffIcon } from '@configs/icons'

const BlurredOverlay = () => {
  return (
    <Box
      sx={{
        inset: 0,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(30px)',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <VisibilityOffIcon
        sx={{ color: 'common.white', fontSize: 64, opacity: 0.7 }}
      />
    </Box>
  )
}

export default BlurredOverlay
