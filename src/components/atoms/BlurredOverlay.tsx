import React from 'react'

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Box } from '@mui/material'

const BlurredOverlay = () => {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
