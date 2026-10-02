import React from 'react'

import { Box } from '@mui/material'

const FallInTransition = ({
  show = false,
  children
}: {
  show: boolean
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transform: show ? '' : 'translateY(-20%) scale(0.9)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
      }}
    >
      {children}
    </Box>
  )
}

export default FallInTransition
