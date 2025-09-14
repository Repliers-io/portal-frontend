'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type React from 'react'

import {
  APIAgent,
  type ApiClientFilterParams,
  type ApiClientResponse
} from 'services/API'

import { initialClientsData } from './constants'

interface AgentClientsContextType {
  loading: boolean
  error: any
  data: ApiClientResponse
  fetchClients: (params?: ApiClientFilterParams) => void
}

export const AgentClientsContext =
  createContext<AgentClientsContextType | null>(null)

interface AgentClientsProviderProps {
  clientId?: number
  children: React.ReactNode
}

const AgentClientsProvider: React.FC<AgentClientsProviderProps> = ({
  clientId,
  children
}) => {
  const [data, setData] = useState(initialClientsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchClients = async (params?: ApiClientFilterParams) => {
    try {
      setLoading(true)
      const data = await APIAgent.fetchClients({
        clientId,
        ...params
      })
      setData(data)
    } catch (error: any) {
      setError(error)
      console.error('Failed to fetch clients', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // don't need to fetch estimates inside client data, so we pass showEstimates param to endpoint
    fetchClients({ showEstimates: clientId ? false : true })
  }, [clientId])

  const contextValue = useMemo(
    () => ({
      data,
      error,
      loading,
      fetchClients
    }),
    [loading, data]
  )

  return (
    <AgentClientsContext.Provider value={contextValue}>
      {children}
    </AgentClientsContext.Provider>
  )
}

export const useAgentClients = () => {
  const context = useContext(AgentClientsContext)

  if (!context) {
    throw Error('[useAgentClients] must be used within a AgentClientsProvider')
  }

  return context
}

export default AgentClientsProvider
