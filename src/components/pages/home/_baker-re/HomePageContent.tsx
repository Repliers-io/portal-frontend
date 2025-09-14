'use client'

import { useTranslations } from 'next-intl'

import { Box, Container, Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'
import HomePageBanner from '@pages/home/components/HomePageBanner'
import { StatsGraph } from '@shared/Stats'

import SearchProvider from 'providers/SearchProvider'

import { FeaturedProperties } from '../components'

const HomePageContent = () => {
  const t = useTranslations()
  const { city } = defaultLocation // Use the default city from location config
  const propertyClass = 'residential'

  return (
    <Box bgcolor="background.default">
      <HomePageBanner
        title={t('HomePage.welcome')}
        subtitle={t('HomePage.welcomeDescription')}
      />
      <FeaturedProperties />
      <Container maxWidth="lg" sx={{ mt: -2 }}>
        <Stack spacing={4} pb={6}>
          <Typography variant="h2" textAlign="center">
            {t('HomePage.trackMarket', { city })}
          </Typography>
          <SearchProvider>
            <StatsGraph city={city} propertyClass={propertyClass} />
          </SearchProvider>
          <Typography
            align="center"
            variant="caption"
            color="text.hint"
            sx={{ whiteSpace: 'pre-line' }}
          >
            {t('Statistics.statsDisclaimer')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

export default HomePageContent
