import { Box, CircularProgress } from '@mui/material'

// `height` holds the space the awaited content will take, so it lands without a jump.
const LoadingContent = ({ height = 220 }: { height?: number | string }) => {
  return (
    <Box sx={{ height, alignContent: 'center', textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default LoadingContent
