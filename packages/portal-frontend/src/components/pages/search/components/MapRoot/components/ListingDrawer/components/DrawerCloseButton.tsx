import { alpha, Box, Button } from '@mui/material'

import { CloseIcon } from '@configs/icons'

export const DrawerCloseButton = ({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) => (
  <Box
    sx={{
      left: '50%',
      top: -36 - 16,
      boxShadow: 1,
      borderRadius: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
      transition: 'opacity 0.15s linear',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none'
    }}
  >
    <Button
      aria-label="Close"
      onClick={onClose}
      sx={{
        p: 0.75,
        width: 36,
        height: 36,
        minWidth: 0,
        borderRadius: '50%',
        color: 'primary.main',
        backdropFilter: 'blur(4px)',
        bgcolor: alpha('#FFFFFF', 0.7),
        '&:hover': { bgcolor: alpha('#FFFFFF', 0.9) }
      }}
    >
      <CloseIcon sx={{ fontSize: 24 }} />
    </Button>
  </Box>
)
