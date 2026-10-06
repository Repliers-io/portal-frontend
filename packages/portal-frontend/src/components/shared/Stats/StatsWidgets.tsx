'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack, Typography } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type PropertyClass } from '@configs/filters'
import { StatsGraph, StatsTabs } from '@shared/Stats'

import SearchProvider from 'providers/SearchProvider'

import { type LocationStatsParams } from './types'

export const StatsWidgets = (
  params: Omit<LocationStatsParams, 'propertyClass'>
) => {
  const { city, name = '' } = params
  const t = useTranslations()
  const [propertyClass, setPropertyClass] =
    useState<PropertyClass>('residential')

  return (
    <SearchProvider>
      <Container maxWidth="lg">
        <Stack spacing={gridConfig.widgetSpacing}>
          <Typography
            variant="h2"
            sx={{ mb: { xs: 0, md: -8 }, whiteSpace: 'pre-line' }}
          >
            {t('Statistics.insightsTitle', { name })}
          </Typography>

          <StatsTabs city={city} onTabChange={setPropertyClass} />
          <StatsGraph city={city} propertyClass={propertyClass} />

          <Typography
            align="center"
            variant="caption"
            color="secondary.main"
            sx={{ whiteSpace: 'pre-line' }}
          >
            {t('Statistics.statsDisclaimer')}
          </Typography>
        </Stack>
      </Container>
    </SearchProvider>
  )
}
