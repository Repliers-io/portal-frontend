'use client'

import type React from 'react'

import { Page404Template } from '@templates'

import { useEstimate } from 'providers/EstimateProvider'

import { FormPageContent, ResultPageContent } from '.'

const EstimateRouteWrapper = () => {
  const { route, loading, estimateError } = useEstimate()

  if (route === 'result') {
    if (!loading && estimateError) return <Page404Template />

    return <ResultPageContent />
  }
  return <FormPageContent />
}

export default EstimateRouteWrapper
