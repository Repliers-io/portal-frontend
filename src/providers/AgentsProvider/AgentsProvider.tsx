import React, { useMemo } from 'react'

import AgentsContext from './AgentsContext'
import useAgentsData from './useAgentsData'

interface AgentsProviderProps {
  children: React.ReactNode
}

const AgentsProvider: React.FC<AgentsProviderProps> = ({ children }) => {
  const { data, loading, processing, create, update, fetch } = useAgentsData()

  const contextValue = useMemo(
    () => ({
      loading,
      data,
      processing,
      fetch,
      create,
      update
    }),
    [loading, processing, data, fetch, create, update]
  )

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  )
}

export default AgentsProvider
