import {
  APIAgent,
  type ApiAgentsCreateParams,
  type ApiAgentsGetParams,
  type ApiAgentsUpdateParams,
  type ApiRplAgent,
  type FubUser
} from 'services/API'

import { extractAgentsError, mapResponse, mapToAgent } from './utils'

export const fetchAgentsRequest = async (
  params: ApiAgentsGetParams = { limit: 10, offset: 0 },
  showError: (message: string) => void
) => {
  try {
    const response = await APIAgent.fetchAgents(params)
    return mapResponse(response)
  } catch (e: any) {
    showError(e.data?.userMessage || e.message || 'Unknown error')
    console.error('Error [fetchAgentsRequest]:', e)
    throw e
  }
}

export const createAgentRequest = async (
  fubUser: FubUser,
  showError: (message: string) => void,
  updateAgents: (fubUser: FubUser, agent: ApiRplAgent) => void,
  showSnackbar: (message: string, type: 'success' | 'error') => void
) => {
  if (fubUser.repliers) return showSnackbar('Agent already exists', 'error')

  try {
    const params: ApiAgentsCreateParams[] = [mapToAgent(fubUser)]
    const agents = await APIAgent.createAgent(params)

    if (!agents) return showError('Agent not created')

    const errorMsg = extractAgentsError(agents)
    if (errorMsg) return showError(errorMsg)

    updateAgents(fubUser, agents[0])
    showSnackbar('Agent created successfully', 'success')
  } catch (e: any) {
    showError(e.data?.userMessage || e.message || 'Unknown error')
    console.error('Error [createAgentRequest]: could not create agent', e)
  }
}

export const updateAgentRequest = async (
  fubUser: FubUser,
  showError: (message: string) => void,
  updateAgents: (fubUser: FubUser, agent: ApiRplAgent) => void,
  showSnackbar: (message: string, type: 'success' | 'error') => void
) => {
  const { repliers, changes } = fubUser

  if (!repliers || !changes?.length) return

  try {
    const params: ApiAgentsUpdateParams = {
      agentId: repliers.agentId,
      ...Object.fromEntries(changes.map(({ prop, to }) => [prop, to]))
    }
    const agent = await APIAgent.updateAgent(params.agentId, params)

    if (!agent) return showError('Agent not updated')

    const updatedFubUser = { ...fubUser }
    delete updatedFubUser.changes

    updateAgents(updatedFubUser, agent)
    showSnackbar('Agent updated successfully', 'success')
  } catch (e: any) {
    showError(e.data?.userMessage || e.message || 'Unknown error')
    console.error('Error [updateAgentRequest]: could not update agent', e)
  }
}
