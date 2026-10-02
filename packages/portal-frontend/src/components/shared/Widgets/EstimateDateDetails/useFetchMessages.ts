import { useEffect, useState } from 'react'

import { APIAgent, type ApiMessage } from 'services/API'
import { useAgentEstimates } from 'providers/AgentEstimatesProvider'

const useFetchMessages = (estimateId?: number) => {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const { clientId, signature } = useAgentEstimates()

  const fetchMessages = async () => {
    if (!clientId || !estimateId) return

    try {
      setLoading(true)
      const { messages } = await APIAgent.fetchMessages(
        clientId,
        estimateId,
        signature
      )
      setMessages(messages)
    } catch (error) {
      console.error('[useFetchMessages]: could not fetch messages', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [clientId, estimateId, signature])

  return { messages, loading, fetchMessages }
}

export default useFetchMessages
