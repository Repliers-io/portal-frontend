import { getTranslations } from 'next-intl/server'

import { Box, Typography } from '@mui/material'

export const EmptyNavigationCard = async ({
  direction
}: {
  direction: 'previous' | 'next'
}) => {
  const t = await getTranslations('Blog')

  return (
    <Box
      sx={{
        p: 2,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: direction === 'next' ? 'flex-start' : 'flex-end'
      }}
    >
      <Typography variant="caption" color="text.hint">
        {direction === 'next' ? t('latestPost') : t('oldestPost')}
      </Typography>
    </Box>
  )
}
