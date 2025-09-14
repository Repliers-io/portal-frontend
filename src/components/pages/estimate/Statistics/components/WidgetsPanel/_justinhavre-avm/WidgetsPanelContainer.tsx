import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Stack, Typography } from '@mui/material'

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
      <Box
        sx={{
          display: 'grid',
          // Create 6 columns for flexible distribution
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(6, 1fr)' // 6 columns for larger screens
          },
          gap: 3, // Spacing between items
          // First three items span 2 columns each (total: 6 columns)
          '& > :nth-child(-n+3)': {
            gridColumn: {
              md: 'span 2' // 2 columns on large screens
            }
          },
          // Fourth and fifth items span 3 columns each (total: 6 columns)
          '& > :nth-child(n+4)': {
            gridColumn: {
              md: 'span 3' // 3 columns on large screens
            }
          }
        }}
      >
        {children}
      </Box>
    </Stack>
  )
}
export default WidgetsPanelContainer
