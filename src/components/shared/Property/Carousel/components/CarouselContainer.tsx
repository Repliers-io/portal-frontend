import React from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import useBreakpoints from 'hooks/useBreakpoints'

const CarouselContainer = ({ children }: { children: React.ReactNode }) => {
  const { values } = useBreakpoints()
  return (
    <Box
      sx={{
        justifyContent: 'center',
        mx: { xs: -2, sm: -3, lg: 0 },
        display: { xs: 'block', sm: 'flex' }
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          userSelect: 'none',
          mx: {
            xs: 0,
            lg: gridConfig.cardCarouselSpacing / -2
          },
          width: {
            xs: 'auto',
            // sm: values.sm,
            // md: values.md - 4,
            lg: values.lg - 8
          }
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default CarouselContainer
