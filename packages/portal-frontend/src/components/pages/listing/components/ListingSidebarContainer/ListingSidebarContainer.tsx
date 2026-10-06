import React from 'react'

import { Box } from '@mui/material'

const sidebarWidth = 276

export const ListingSidebarContainer = ({
  embedded,
  children
}: {
  embedded?: boolean
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        top: 32 + (embedded ? 52 : 60),
        // 32px is the offset between content containers
        // 52 / 60px is the height of the NavigationBar wheither it's embedded or not
        minWidth: sidebarWidth,
        flexShrink: 0, // badly formatted content from the main column tries to push the sidebar out of the screen
        width: { xs: '100%', md: sidebarWidth },
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
