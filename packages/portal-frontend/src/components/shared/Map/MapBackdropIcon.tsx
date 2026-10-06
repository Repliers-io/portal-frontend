import { Box } from '@mui/material'

import { ForestOutlinedIcon } from '@configs/icons'

type MapBackdropIconProps = {
  opacity?: number
}

export const MapBackdropIcon = ({ opacity = 1 }: MapBackdropIconProps) => (
  <Box
    sx={{
      top: '50%',
      left: '50%',
      position: 'absolute',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      opacity
    }}
  >
    <ForestOutlinedIcon sx={{ fontSize: 64, color: 'common.white' }} />
  </Box>
)
