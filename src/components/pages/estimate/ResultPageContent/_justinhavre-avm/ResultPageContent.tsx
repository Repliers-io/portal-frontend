'use client'

import React, { useEffect } from 'react'

import { Container, Stack } from '@mui/material'

import { ClientSidePageTemplate } from '@templates'
import {
  MortgageCalculationBanner,
  MortgageEquityBanner,
  SpecialOfferBanner,
  TeamStatsBanner
} from '@pages/estimate/Banners'
import {
  getPropertyClass,
  LocationStatistics,
  WidgetsPanel
} from '@pages/estimate/Statistics'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'

import {
  EstimateCard,
  EstimateResultHeader,
  PriceTrends,
  PropertyHomeFacts,
  SoldAndSimilarPropertyCarousels
} from '../components'

const EstimateResultContent = () => {
  const trackEvent = useAnalytics()
  const { userRole, logged } = useUser()
  const { loading, estimateData, editing } = useEstimate()
  const propertyClass = getPropertyClass(estimateData?.payload)
  const { city, neighborhood } = estimateData?.payload?.address || {}

  const showOffer = Boolean(!logged || userRole)

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

          {showOffer && <SpecialOfferBanner />}

          <PropertyHomeFacts />

          {editing && <MortgageEquityBanner />}

          {editing && <MortgageCalculationBanner />}

          <PriceTrends />

          <TeamStatsBanner />

          {neighborhood && (
            <WidgetsPanel
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

export default EstimateResultContent
