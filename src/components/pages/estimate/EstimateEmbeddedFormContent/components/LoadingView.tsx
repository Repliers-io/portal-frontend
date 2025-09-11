import { Box, CircularProgress } from '@mui/material'

const LoadingView = () => (
  <Box
    sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <CircularProgress />
  </Box>
)

export default LoadingView
