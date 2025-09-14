'use client'

import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import defaultLocation from '@configs/location'
import { StatsWidgets } from '@shared/Stats'

import { useFeatures } from 'providers/FeaturesProvider'

import { FeaturedProperties, HomePageBanner } from './components'

const HomePageContent = () => {
  const features = useFeatures()
  const t = useTranslations('HomePage')

  const { state, defaultFilters } = defaultLocation

  return (
    <Box bgcolor="background.default">
      <HomePageBanner title={t('welcome')} subtitle={t('welcomeDescription')} />
      <FeaturedProperties />
      {features.dashboard && <StatsWidgets {...defaultFilters} name={state} />}
    </Box>
  )
}

export default HomePageContent
