import React from 'react'

import { Box } from '@mui/material'

const MultiUnitContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        p: 2,
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: 'background.paper'
      }}
    >
      {children}
    </Box>
  )
}
export default MultiUnitContainer
