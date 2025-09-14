import { Box, CircularProgress } from '@mui/material'

const LoadingContent = () => {
  return (
    <Box sx={{ height: 220, alignContent: 'center', textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default LoadingContent
