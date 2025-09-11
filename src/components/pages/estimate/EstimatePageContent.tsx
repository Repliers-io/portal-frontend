'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { features } from 'features'

import { Page404Template } from '@templates'

import EstimateProvider from 'providers/EstimateProvider'
import EstimateStepsProvider from 'providers/EstimateStepsProvider'
import SearchProvider from 'providers/SearchProvider'
import SelectOptionsProvider from 'providers/SelectOptionsProvider'

import { EstimateRouteWrapper } from '.'

const EstimatePageContent = () => {
  const params = useSearchParams()
  const step = Number(params.get('step')) || 0
  const clientId = Number(params.get('clientId')) || undefined
  const estimateId = Number(params.get('estimateId')) || undefined
  const signature = params.get('s') || undefined

  if (!features.estimate) return <Page404Template />

  return (
    <SearchProvider>
      <SelectOptionsProvider>
        <EstimateProvider
          step={step}
          clientId={clientId}
          estimateId={estimateId}
          signature={signature}
        >
          <EstimateStepsProvider>
            <EstimateRouteWrapper />
          </EstimateStepsProvider>
        </EstimateProvider>
      </SelectOptionsProvider>
    </SearchProvider>
  )
}

export default EstimatePageContent
