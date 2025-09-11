import { Box, Typography } from '@mui/material'

import content from '@configs/content'
const FullscreenFooter = () => {
  return (
    <Box
      sx={{
        p: 2.5,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        position: 'absolute'
      }}
    >
      <Typography
        variant="body2"
        color="common.white"
        textAlign="center"
        sx={{ textShadow: '0 0 10px #0006', whiteSpace: 'pre-line' }}
      >
        {content.siteFullscreenFooter}
      </Typography>
    </Box>
  )
}
export default FullscreenFooter
