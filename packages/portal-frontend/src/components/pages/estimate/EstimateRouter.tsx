/**
 * Estimate entry: branches on `useEstimate().route` + agent role to render the client
 * landing (multi-step form), the agent landing, or the result page.
 * Anatomy: docs → product-guide/estimate/technical.
 */
'use client'

import React from 'react'

import { Error40XView, LoadingView } from 'components/atoms'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'

import {
  AgentLandingPageContent,
  ClientLandingPageContent,
  ResultPageContent
} from '.'

export const EstimateRouter = () => {
  const { route, loading, estimateData, estimateError } = useEstimate()
  const { agentRole } = useUser()

  if (route === 'result') {
    if (estimateError && !loading) return <Error40XView />
    // Show loading while data is being fetched
    if (!estimateData || loading) return <LoadingView />

    return <ResultPageContent />
  }

  return agentRole ? <AgentLandingPageContent /> : <ClientLandingPageContent />
}
