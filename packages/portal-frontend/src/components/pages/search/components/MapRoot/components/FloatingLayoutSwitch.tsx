import { Box } from '@mui/material'

import { borderMargin, MapLayoutSwitch } from '@shared/Map'

// MapRoot renders it on mobile and tablet only. On phones it sits level with the
// locate button, at the controls' edge margin.
export const FloatingLayoutSwitch = () => (
  <Box
    sx={{
      top: { xs: borderMargin, sm: 12 },
      left: '50%',
      zIndex: 'tooltip',
      position: 'absolute',
      transform: 'translateX(-50%)'
    }}
  >
    <MapLayoutSwitch variant="floating" />
  </Box>
)
