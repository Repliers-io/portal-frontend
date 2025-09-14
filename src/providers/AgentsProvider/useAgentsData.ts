'use client'

import { useEffect, useState } from 'react'

import type {
  ApiAgentsGetParams,
  ApiRplAgent,
  FubUser,
  FubUsersResponse
} from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

import {
  createAgentRequest,
  fetchAgentsRequest,
  updateAgentRequest
} from './request'

const defaultData: FubUsersResponse = {
  limit: 0,
  offset: 0,
  total: 0,
  agents: []
}

const useAgentsData = () => {
  const { showSnackbar } = useSnackbar()
  const [data, setData] = useState<FubUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const { adminRole } = useUser()

  const showError = (message: string) => {
    showSnackbar(message, 'error')
    setLoading(false)
    setProcessing(false)
  }

  const updateRplAgent = (fubUser: FubUser, agent: ApiRplAgent) => {
    const agents = data?.agents ?? []
    return agents.map((user) =>
      user.id === fubUser.id ? { ...fubUser, repliers: agent } : user
    )
  }

  const updateAgents = (fubUser: FubUser, agent: ApiRplAgent) => {
    setData((prev) => ({
      ...(prev ?? defaultData),
      agents: updateRplAgent(fubUser, agent)
    }))
  }

  const fetch = async (
    params: ApiAgentsGetParams = { limit: 10, offset: 0 }
  ) => {
    if (!adminRole) return

    setLoading(true)
    setData(await fetchAgentsRequest(params, showError))
    setLoading(false)
  }

  const create = async (fubUser: FubUser) => {
    if (!adminRole) return

    setProcessing(true)
    await createAgentRequest(fubUser, showError, updateAgents, showSnackbar)
    setProcessing(false)
  }

  const update = async (fubUser: FubUser) => {
    if (!adminRole) return

    setProcessing(true)
    await updateAgentRequest(fubUser, showError, updateAgents, showSnackbar)
    setProcessing(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  return {
    data,
    loading,
    processing,
    fetch,
    create,
    update
  }
}

export default useAgentsData
