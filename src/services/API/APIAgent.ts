import queryString from 'query-string'

import type { EstimateData } from '@configs/estimate'

import APIBase from './APIBase'
import {
  type ApiAgentsCreateParams,
  type ApiAgentsGetParams,
  type ApiAgentsResponse,
  type ApiAgentsUpdateParams,
  type ApiClientEstimateResponse,
  type ApiClientFilterParams,
  type ApiClientResponse,
  type ApiMessageResponse,
  type ApiRplAgent,
  type ApiUserProfile
} from './types'

class APIAgent extends APIBase {
  fetchAgents(params?: ApiAgentsGetParams): Promise<ApiAgentsResponse> {
    const url = `/admin/agents?${queryString.stringify(params || {})}`

    return this.fetchJSON(url)
  }

  createAgent(params: ApiAgentsCreateParams[]): Promise<ApiRplAgent[]> {
    return this.fetchJSON('/admin/agents', {
      method: 'POST',
      body: JSON.stringify(params)
    })
  }

  updateAgent(
    agentId: number,
    params: ApiAgentsUpdateParams
  ): Promise<ApiRplAgent> {
    return this.fetchJSON(`/admin/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(params)
    })
  }

  fetchClients(params?: ApiClientFilterParams): Promise<ApiClientResponse> {
    const queryParams = queryString.stringify(params || {})
    return this.fetchJSON(
      `/agent/client${queryParams ? `?${queryParams}` : ''}`
    )
  }

  fetchClient(
    clientId: number,
    signature?: string
  ): Promise<ApiClientResponse> {
    return this.fetchJSON(
      `/agent/client/${clientId}${signature ? `?s=${signature}` : ''}`
    )
  }

  updateClient(
    clientId: number,
    profile: Partial<ApiUserProfile>,
    signature?: string
  ): Promise<ApiUserProfile> {
    return this.fetchJSON(
      `/agent/client/${clientId}${signature ? `?s=${signature}` : ''}`,
      {
        method: 'PATCH',
        body: JSON.stringify(profile)
      }
    )
  }

  fetchEstimates(
    clientId: number,
    signature?: string
  ): Promise<ApiClientEstimateResponse> {
    return this.fetchJSON(
      `/agent/estimate/${clientId}${signature ? `?s=${signature}` : ''}`
    )
  }

  fetchMessages(
    clientId: number,
    estimateId: number,
    signature?: string
  ): Promise<ApiMessageResponse> {
    return this.fetchJSON(
      `/agent/messages/${clientId}?estimateId=${estimateId}${signature ? `&s=${signature}` : ''}`
    )
  }

  createEstimate(
    clientId: string,
    estimate: Partial<EstimateData>,
    signature?: string
  ) {
    return this.fetchJSON(
      `/agent/estimate/${clientId}${signature ? `?s=${signature}` : ''}`,
      {
        method: 'POST',
        body: JSON.stringify(estimate)
      }
    )
  }

  updateEstimate(
    estimateId: number,
    estimate: Partial<EstimateData>,
    signature?: string
  ) {
    return this.fetchJSON(
      `/agent/estimate/${estimateId}${signature ? `?s=${signature}` : ''}`,
      {
        method: 'PATCH',
        body: JSON.stringify(estimate)
      }
    )
  }

  removeEstimate(estimateId: number, signature?: string) {
    return this.fetchRaw(
      `/agent/estimate/${estimateId}${signature ? `?s=${signature}` : ''}`,
      {
        method: 'DELETE'
      }
    )
  }

  sendEstimateEmail(estimateId: number, signature?: string) {
    return this.fetchJSON(
      `/agent/estimate/${estimateId}/send${signature ? `?s=${signature}` : ''}`,
      {
        method: 'POST'
      }
    )
  }
}

const apiAgentInstance = new APIAgent()

export default apiAgentInstance
