import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type React from 'react'

import { type EstimateData } from '@configs/estimate'

import { APIAgent, type ApiClient } from 'services/API'

import { useEstimateUrl } from './EstimateProvider'

interface AgentEstimatesContextType {
  error: any
  loading: boolean
  updating: boolean
  signature?: string
  clientId?: number
  client: ApiClient | null
  estimates: EstimateData[]
  updateEstimate: (estimateId: number, estimate: Partial<EstimateData>) => void
  removeEstimate: (estimateId: number) => void
  // TODO: maybe better move this state to separate provider
  estimateToRemove: EstimateData | null
  setEstimateToRemove: (estimate: EstimateData | null) => void
  sendEstimateEmail: (estimateId: number) => void
  getEstimateUrl: (
    estimateId?: number | string,
    step?: number | null,
    forceClientUrl?: boolean
  ) => string
}

export const AgentEstimatesContext =
  createContext<AgentEstimatesContextType | null>(null)

interface AgentClientsProviderProps {
  clientId?: number
  signature?: string
  children: React.ReactNode
}

const AgentEstimatesProvider: React.FC<AgentClientsProviderProps> = ({
  clientId,
  signature,
  children
}) => {
  const [client, setClient] = useState<ApiClient | null>(null)
  const [estimates, setEstimates] = useState<EstimateData[]>([])
  // Initialize loading to true if clientId is present
  const [loading, setLoading] = useState(!!clientId)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [estimateToRemove, setEstimateToRemove] = useState<EstimateData | null>(
    null
  )
  const { getEstimateUrl } = useEstimateUrl('route', clientId, signature)

  const fetchClient = useCallback(async () => {
    if (!clientId) {
      setLoading(false) // Ensure loading is false if no clientId
      return
    }
    try {
      setLoading(true)
      setError(null)
      const clientResponse = await APIAgent.fetchClient(clientId, signature)

      setClient(clientResponse.clients[0] || null)
      // NOTE: client endpoint returns estimates as well, no need to fetch them separately
      setEstimates(clientResponse.clients[0].estimates || [])
    } catch (err: any) {
      setError(err)
      console.error(
        '[AgentEstimatesProvider] failed to fetch initial data',
        err
      )
    } finally {
      setLoading(false)
    }
  }, [clientId, signature])

  const removeEstimate = useCallback(
    async (estimateId: number) => {
      try {
        setLoading(true)
        await APIAgent.removeEstimate(estimateId, signature)
        setEstimates((prevEstimates) =>
          prevEstimates.filter((estimate) => estimate.estimateId !== estimateId)
        )
      } catch (error: any) {
        setError(error)
        console.error('Failed to remove estimate', error)
      } finally {
        setLoading(false)
      }
    },
    [signature]
  )

  const updateEstimate = useCallback(
    async (estimateId: number, estimateData: Partial<EstimateData>) => {
      try {
        setUpdating(true)
        const updatedEstimate = await APIAgent.updateEstimate(
          estimateId,
          estimateData,
          signature
        )
        setEstimates((prevEstimates) =>
          prevEstimates.map((est: any) =>
            est.estimateId === estimateId ? updatedEstimate : est
          )
        )
      } catch (error: any) {
        setError(error)
        console.error('Failed to update estimate', error)
      } finally {
        setUpdating(false)
      }
    },
    [signature]
  )

  const sendEstimateEmail = useCallback(
    async (estimateId: number) => {
      try {
        await APIAgent.sendEstimateEmail(estimateId, signature)
        setEstimates((prev) =>
          prev.map((est) =>
            est.estimateId === estimateId
              ? { ...est, lastSendEmailOn: new Date().toISOString() }
              : est
          )
        )
      } catch (error: any) {
        setError(error)
        console.error('Failed to send estimate email', error)
        throw error
      }
    },
    [signature]
  )

  useEffect(() => {
    fetchClient()
  }, [fetchClient]) // Corrected dependency array

  const contextValue = useMemo(
    () => ({
      clientId,
      client,
      error,
      loading,
      updating,
      signature,
      estimates,
      removeEstimate,
      updateEstimate,
      estimateToRemove,
      setEstimateToRemove,
      sendEstimateEmail,
      getEstimateUrl
    }),
    [
      clientId,
      client,
      error,
      loading,
      updating,
      signature,
      estimates,
      estimateToRemove
    ]
  )

  return (
    <AgentEstimatesContext.Provider value={contextValue}>
      {children}
    </AgentEstimatesContext.Provider>
  )
}

export const useAgentEstimates = () => {
  const context = useContext(AgentEstimatesContext)

  if (!context) {
    throw Error(
      '[useAgentEstimates] must be used within a AgentEstimatesProvider'
    )
  }

  return context
}

export default AgentEstimatesProvider
