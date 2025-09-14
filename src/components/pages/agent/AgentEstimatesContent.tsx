'use client'

import React from 'react'

import { EstimateRemoveDialog } from '@shared/Dialogs'

import AgentEstimatesProvider from 'providers/AgentEstimatesProvider'

import {
  AgentEstimatesLayout,
  EstimatesList,
  EstimatesTopBar,
  Profile
} from './components'

const AgentEstimatesContent = ({
  clientId,
  signature
}: {
  clientId: number
  signature?: string
}) => {
  return (
    <AgentEstimatesProvider clientId={clientId} signature={signature}>
      <AgentEstimatesLayout
        topSlot={<EstimatesTopBar />}
        leftSlot={<Profile />}
        rightSlot={<EstimatesList />}
      />
      <EstimateRemoveDialog />
    </AgentEstimatesProvider>
  )
}

export default AgentEstimatesContent
