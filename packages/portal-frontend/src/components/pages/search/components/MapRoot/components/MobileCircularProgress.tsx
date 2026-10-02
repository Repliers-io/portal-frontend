import { Box, CircularProgress } from '@mui/material'

export const MobileCircularProgress = () => {
  return (
    <Box
      sx={{
        top: '16px',
        left: '16px',
        position: 'absolute',
        display: { xs: 'block', md: 'none' }
      }}
    >
      <CircularProgress size={16} />
    </Box>
  )
}
