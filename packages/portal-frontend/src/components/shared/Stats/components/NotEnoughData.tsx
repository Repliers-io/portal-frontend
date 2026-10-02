import { useTranslations } from 'next-intl'

import { Box, Typography } from '@mui/material'

export const NotEnoughData = () => {
  const t = useTranslations('Charts')

  return (
    <Box
      sx={{
        inset: 0,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(20px)'
      }}
    >
      <Typography variant="h6">{t('noData')}</Typography>
    </Box>
  )
}
