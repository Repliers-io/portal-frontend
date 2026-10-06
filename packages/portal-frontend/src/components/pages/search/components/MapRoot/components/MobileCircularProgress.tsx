import { Box, CircularProgress } from '@mui/material'

import { useMapOptions } from 'providers/MapOptionsProvider'

export const MobileCircularProgress = () => {
  const { style } = useMapOptions()

  return (
    <Box
      sx={{
        // phones: centred on the FloatingLayoutSwitch (top 16px, 38px tall)
        top: { xs: 27, sm: 16 },
        left: '16px',
        position: 'absolute',
        display: { xs: 'block', md: 'none' }
      }}
    >
      <CircularProgress
        size={16}
        sx={{ color: style === 'map' ? 'primary.main' : 'common.white' }}
      />
    </Box>
  )
}
