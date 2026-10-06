import { type ApiLocationCoordinates } from './locations'

export interface ApiRplAgent {
  status: boolean
  agentId: number
  fname: string
  lname: string
  phone: string
  email: string
  proxyPhone: string
  proxyEmail: string
  avatar?: string | null
  brokerage: string
  designation: string
  location?: ApiLocationCoordinates | null
  externalId?: string | null
  data?: Record<string, unknown> | null
}

export interface ApiAgentByIdResponse {
  agent: ApiRplAgent
}

export interface FubUserDiff<T = any> {
  prop: string
  from: T
  to: T
}

export interface ApiFUBUser {
  id: number
  created: string
  updated: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  status: string
  timezone: string
  beta: boolean
  picture: Record<string, string>
  pauseLeadDistribution: boolean
  lastSeenIos: null | string
  lastSeenAndroid: null | string
  lastSeenFub2: string
  canExport: boolean
  canCreateApiKeys: boolean
  isOwner: boolean
  groups: Array<{
    id: number
    name: string
  }>
  teamIds: number[]
  teamLeaderOf: unknown[]
  leadEmailAddress: string
  repliers: ApiRplAgent[]
}

export interface ApiAgentsResponse {
  offset: number
  limit: number
  total: number
  agents: ApiFUBUser[]
}

export type FubUser = Omit<ApiFUBUser, 'repliers'> & {
  changes?: FubUserDiff[]
  repliers?: ApiRplAgent
}

export type FubUsersResponse = Omit<ApiAgentsResponse, 'agents'> & {
  agents: FubUser[]
}

export interface ApiAgentsGetParams {
  limit: number
  offset: number
}

export interface ApiAgentsCreateParams {
  fname: string
  lname: string
  phone: string
  email: string
  brokerage: string
  designation: string
  avatar?: string
  location?: ApiLocationCoordinates
  status?: boolean
  externalId?: string
  data?: Record<string, unknown>
}

export interface ApiAgentsCreateResponse {
  agent: ApiRplAgent
  [key: string]: unknown
}

export type ApiAgentsUpdateParams = Partial<ApiAgentsCreateParams> & {
  agentId: number
}

export type ApiAgentsUpdateResponse = ApiAgentsCreateResponse
