'use client'

import React from 'react'

import { useUser } from 'providers/UserProvider'

import {
  AgentLandingPage,
  ClientLandingPage,
  FormPageContainer
} from './components'

const FormPageContent = () => {
  const { agentRole } = useUser()

  return (
    <FormPageContainer>
      {agentRole ? <AgentLandingPage /> : <ClientLandingPage />}
    </FormPageContainer>
  )
}

export default FormPageContent
