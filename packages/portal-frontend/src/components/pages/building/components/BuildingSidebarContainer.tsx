'use client'

import React from 'react'

import { Box } from '@mui/material'

export const BuildingSidebarContainer = ({
  children
}: {
  children?: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        top: 32 + 60,
        // 32px is the offset between content containers
        // 52 / 60px is the height of the NavigationBar wheither it's embedded or not
        minWidth: 276,
        flexShrink: 0, // badly formatted content from the main column tries to push the sidebar out of the screen
        width: { xs: '100%', md: 276 },
        position: { xs: 'static', md: 'sticky' },
        '& .MuiPaper-root': {
          height: 'auto'
        }
      }}
    >
      {children}
    </Box>
  )
}
