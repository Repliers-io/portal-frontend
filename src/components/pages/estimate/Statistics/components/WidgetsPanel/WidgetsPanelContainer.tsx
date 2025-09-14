import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

const WidgetsPanelContainer = ({
  name,
  children
}: {
  name: string
  children: React.ReactNode
}) => {
  const t = useTranslations()

  return (
    <Stack spacing={4}>
      <Typography variant="h2">
        {t('Statistics.insightsTitle', { name })}
      </Typography>
      <Stack
        display="grid"
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        }}
        spacing={{
          xs: 2,
          sm: 3
        }}
        sx={{
          '& > :nth-of-type(3)': {
            gridColumn: { md: '1' } // make the third item start new row
          }
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
export default WidgetsPanelContainer
