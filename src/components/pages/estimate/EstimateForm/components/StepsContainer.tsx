import React from 'react'

import { Box, Stack } from '@mui/material'

import { estimateFormMinHeight } from '@configs/estimate'

import { useEstimate } from 'providers/EstimateProvider'
import useClientSide from 'hooks/useClientSide'

const StepsContainer = ({
  showControls = true,
  children
}: {
  showControls?: boolean
  children: React.ReactNode
}) => {
  const { loading } = useEstimate()
  const clientSide = useClientSide()

  const loadingStyles =
    loading || !clientSide ? { opacity: 0.7, pointerEvents: 'none' } : {}

  const stepStyles = {
    alignItems: { xs: 'center', md: 'flex-start' },
    justifyContent: { sx: 'flex-start', md: 'center' },
    height: estimateFormMinHeight
    // this height value would be used more like a guidance for the container,
    // as it will be auto-resized by flex: 1
  }

  return (
    <Box
      sx={{
        p: { xs: 0, sm: 2 },
        // small shift for the scroll indicator,
        // child <Box /> has { px: 3 } + { px: 1 } (this value) = 4
        px: { xs: 0, md: 1 },
        flex: 1,
        width: '100%',
        borderRadius: 2,
        boxSizing: 'border-box',
        bgcolor: showControls ? 'background.paper' : 'transparent',
        ...loadingStyles
      }}
    >
      <Box
        sx={{
          px: { xs: 0, md: 3 },
          width: '100%',
          height: '100%',
          display: 'flex',
          overflowY: 'auto',
          boxSizing: 'border-box',
          flexDirection: 'column'
        }}
      >
        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          alignItems="flex-start"
          justifyContent="flex-start"
          sx={stepStyles}
        >
          {children}
        </Stack>
      </Box>
    </Box>
  )
}

export default StepsContainer
