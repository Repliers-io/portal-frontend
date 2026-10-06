import { Box, CircularProgress } from '@mui/material'

export const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}
    >
      <CircularProgress size={48} sx={{ color: 'common.white' }} />
    </Box>
  )
}
