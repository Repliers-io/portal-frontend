import { Box, CircularProgress } from '@mui/material'

import { FullscreenView } from '.'

const LoadingView = ({ noHeader = false }: { noHeader?: boolean }) => {
  return (
    <FullscreenView noHeader={noHeader}>
      <Box sx={noHeader ? {} : { paddingBottom: '72px' }}>
        <CircularProgress />
      </Box>
    </FullscreenView>
  )
}

export default LoadingView
