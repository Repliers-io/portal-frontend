import React from 'react'

import { Box } from '@mui/material'

const BannerContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box minHeight={{ xs: 640, md: 'calc(100svh - 72px)' }} position="relative">
      {children}
    </Box>
  )
}

export default BannerContainer
