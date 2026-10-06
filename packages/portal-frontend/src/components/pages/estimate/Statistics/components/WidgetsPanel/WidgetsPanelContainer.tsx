import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Stack, Typography } from '@mui/material'

import { formatPropertyClassLabel } from 'utils/listings/formatters'

import { WidgetsDisclaimer } from './WidgetsDisclaimer'

type WidgetsPanelContainerProps = {
  name: string
  children: React.ReactNode
  // Provided by the dashboard (tabbed) usage; absent on the estimate page.
  wrapThirdItem?: boolean
  tabsSlot?: React.ReactNode
  propertyClass?: string
}

const WidgetsPanelContainer = ({
  name,
  children,
  wrapThirdItem = true,
  tabsSlot,
  propertyClass
}: WidgetsPanelContainerProps) => {
  const t = useTranslations()

  const grid = (
    <Stack
      className="widgets-panel"
      display="grid"
      gridTemplateColumns={{
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)'
      }}
      spacing={{
        xs: 2,
        sm: 4
      }}
      sx={
        wrapThirdItem
          ? {
              '& > :nth-of-type(3)': {
                gridColumn: { md: '1' } // make the third item start new row
              }
            }
          : undefined
      }
    >
      {children}
    </Stack>
  )

  // Rich header (disclaimer + navigation tabs) — only for the dashboard usage.
  if (tabsSlot) {
    return (
      <Stack spacing={4}>
        <Stack
          spacing={{ xs: 1, md: 2 }}
          flexWrap="wrap"
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="h2">
            {t('Statistics.insightsTitle', {
              name,
              propertyClass: formatPropertyClassLabel(propertyClass)
            })}
          </Typography>

          <Box
            sx={{
              order: { xs: 2, sm: 3, md: 2 },
              width: { xs: '100%', md: 'auto' }
            }}
          >
            <WidgetsDisclaimer />
          </Box>
          <Box
            sx={{
              display: 'flex',
              pt: { xs: 2, sm: 0 },
              justifyContent: 'center',
              order: { xs: 3, sm: 2, md: 3 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {tabsSlot}
          </Box>
        </Stack>
        {grid}
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h2">
        {t('Statistics.insightsTitle', { name })}
      </Typography>
      {grid}
    </Stack>
  )
}
export default WidgetsPanelContainer
