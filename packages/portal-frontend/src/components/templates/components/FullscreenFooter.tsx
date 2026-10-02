import { useTranslations } from 'next-intl'

import { Box, Typography } from '@mui/material'

const FullscreenFooter = () => {
  const t = useTranslations()

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
        {t('Footer.fullscreen')}
      </Typography>
    </Box>
  )
}
export default FullscreenFooter
