'use client'

import { useSearchParams } from 'next/navigation'

import { Typography } from '@mui/material'

import { EstimatesBreadcrumbs } from '@pages/agent/components'

import AgentEstimatesProvider from 'providers/AgentEstimatesProvider'
import { useUser } from 'providers/UserProvider'

import { AgentBanner } from '.'

const EstimateResultHeader = () => {
  const { agentRole } = useUser()
  const searchParams = useSearchParams()
  const signature = searchParams.get('s') || ''

  let clientId = Number(searchParams.get('clientId'))
  const slugs = window?.location?.pathname.split('/')
  if (!clientId && slugs[2] === 'client' && slugs.length > 3) {
    clientId = Number(slugs[3]) // '/agent/client/[148633]/estimate...'
  }

  return agentRole && clientId ? (
    <AgentEstimatesProvider clientId={clientId} signature={signature}>
      <EstimatesBreadcrumbs />
      <AgentBanner />
    </AgentEstimatesProvider>
  ) : (
    <Typography variant="h3">Home Valuation</Typography>
  )
}

export default EstimateResultHeader
