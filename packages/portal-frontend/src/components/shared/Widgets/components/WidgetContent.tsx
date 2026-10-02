import React from 'react'

import { Box } from '@mui/material'

export const WidgetContent = ({
  index,
  visible,
  children
}: {
  index: number
  visible: boolean
  children: React.ReactNode
}) => {
  const transitionDelay = `${index * 0.1}s`

  return (
    <Box p={3} flexGrow="1" display="flex">
      <Box
        flexGrow="1"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={
          index !== -1
            ? {
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.2s ease',
                transitionDelay
              }
            : {}
        }
      >
        {children}
      </Box>
    </Box>
  )
}
