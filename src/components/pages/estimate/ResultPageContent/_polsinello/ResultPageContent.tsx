'use client'

import { useEffect } from 'react'
import type React from 'react'

import { Container, Stack } from '@mui/material'

import { ClientSidePageTemplate } from '@templates'
import { TeamStatsBanner } from '@pages/estimate/Banners'
import {
  getPropertyClass,
  LocationStatistics
} from '@pages/estimate/Statistics'

import { useEstimate } from 'providers/EstimateProvider'
import useAnalytics from 'hooks/useAnalytics'

import {
  EstimateCard,
  EstimateResultHeader,
  PriceTrends,
  PropertyHomeFacts,
  SoldAndSimilarPropertyCarousels
} from '../components'

const ResultPageContent = () => {
  const trackEvent = useAnalytics()
  const { loading, estimateData } = useEstimate()
  const propertyClass = getPropertyClass(estimateData?.payload)
  const { city, neighborhood } = estimateData?.payload?.address || {}

  useEffect(() => {
    if (estimateData) {
      trackEvent('view_estimate_result_page', {
        estimateId: estimateData?.estimateId,
        clientId: estimateData?.clientId,
        ulid: estimateData?.ulid
      })
    }
  }, [estimateData])

  return (
    <ClientSidePageTemplate
      loading={!estimateData || loading}
      bgcolor="background.default"
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <EstimateResultHeader />

          <EstimateCard />

          <PropertyHomeFacts />

          <PriceTrends />

          <TeamStatsBanner />

          {neighborhood && (
            <LocationStatistics
              neighborhood={neighborhood}
              propertyClass={propertyClass}
            />
          )}

          {city && (
            <LocationStatistics city={city} propertyClass={propertyClass} />
          )}

          <SoldAndSimilarPropertyCarousels />
        </Stack>
      </Container>
    </ClientSidePageTemplate>
  )
}

export default ResultPageContent
