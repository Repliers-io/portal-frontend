import React from 'react'

import { Box } from '@mui/material'

export const GridHeaderContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        p: 2,
        width: '100%',
        borderRadius: 2,
        boxSizing: 'border-box',
        bgcolor: 'background.default'
      }}
    >
      {children}
    </Box>
  )
}
