'use client'

import { createContext, useContext } from 'react'

import type {
  ApiAgentsGetParams,
  FubUser,
  FubUsersResponse
} from 'services/API'

interface AgentsContextType {
  loading: boolean // for fetch
  processing: boolean // for create/update
  data: FubUsersResponse | null
  fetch: (params: ApiAgentsGetParams) => void
  create: (fubUser: FubUser) => void
  update: (fubUser: FubUser) => void
}

const AgentsContext = createContext<AgentsContextType | null>(null)

export const useAgents = () => {
  const context = useContext(AgentsContext)

  if (!context) {
    throw Error('[useAgents] must be used within a AgentsProvider')
  }

  return context
}

export default AgentsContext
