'use client'

import { useEffect } from 'react'
import React from 'react'

import { Container, Stack } from '@mui/material'

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
  SoldAndSimilarListingCarousels
} from './components'

export const ResultPageContent = () => {
  const trackEvent = useAnalytics()
  const { estimateData } = useEstimate()
  const propertyClass = getPropertyClass(estimateData?.payload)
  const { city, neighborhood } = estimateData?.payload?.address || {}

  useEffect(() => {
    if (estimateData) {
      const { estimateId, clientId, ulid } = estimateData
      trackEvent('view_estimate_result_page', {
        estimateId,
        clientId,
        ulid
      })
    }
  }, [estimateData])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <EstimateResultHeader />

        <EstimateCard />

        <PropertyHomeFacts />

        <PriceTrends />

        {neighborhood && (
          <LocationStatistics
            neighborhood={neighborhood}
            propertyClass={propertyClass}
          />
        )}

        {city && (
          <LocationStatistics city={city} propertyClass={propertyClass} />
        )}

        <SoldAndSimilarListingCarousels />
      </Stack>
    </Container>
  )
}
