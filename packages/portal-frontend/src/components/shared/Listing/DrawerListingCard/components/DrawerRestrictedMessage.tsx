import { Box } from '@mui/material'

import { VisibilityOffOutlinedIcon } from '@configs/icons'
import { RestrictedMessage } from '@shared/Photos'

import { getDrawerGalleryStyles } from '../utils'

export const DrawerRestrictedMessage = () => {
  return (
    <Box
      sx={{
        inset: 0,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        bgcolor: '#0008'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...getDrawerGalleryStyles()
        }}
      >
        <VisibilityOffOutlinedIcon
          fontSize="medium"
          sx={{ color: 'common.white' }}
        />
      </Box>
      <RestrictedMessage variant="drawer" />
    </Box>
  )
}
