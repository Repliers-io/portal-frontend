/**
 * Root of the landing page (`/`). Composes the default home from a banner, featured
 * listings, and (when `features.dashboard` is on) market-stats widgets — all config-driven.
 * Tenants replace this via a `_<tenant>/HomePageContent` component override.
 * Anatomy: docs → product-guide/home/technical.
 */
import { getTranslations } from 'next-intl/server'

import { Box } from '@mui/material'

import features from '@configs/features'
import locationConfig from '@configs/location'
import { StatsWidgets } from '@shared/Stats'

import { FeaturedListings, HomePageBanner } from './components'

const { city, defaultFilters } = locationConfig

const HomePageContent = async () => {
  const t = await getTranslations('HomePage')

  return (
    <Box bgcolor="background.default" pb={4}>
      <HomePageBanner title={t('welcome')} subtitle={t('welcomeDescription')} />
      <FeaturedListings />
      {features.dashboard && <StatsWidgets {...defaultFilters} name={city} />}
    </Box>
  )
}

export default HomePageContent
