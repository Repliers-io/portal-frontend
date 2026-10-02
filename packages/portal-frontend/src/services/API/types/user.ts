import { type EstimateData } from '@configs/estimate'

import { type ApiUserProfile } from './auth'
import { type ApiCoords } from './common'

export type ApiFubAddress = Partial<{
  city: string
  code: string
  country: string
  state: string
  street: string
  type: string
}>

export interface ApiClientAgent {
  status: boolean
  agentId: number
  fname: string
  lname: string
  phone: string
  email: string
  proxyPhone: string
  proxyEmail: string
  avatar: string | null
  brokerage: string
  designation: string
  location: ApiCoords | null
  externalId: string | null
  data: Record<string, unknown> | null
}

export interface ApiClient extends ApiUserProfile {
  estimates?: EstimateData[]
  data?: {
    fub?: {
      addresses?: ApiFubAddress[]
    }
  }
}

export interface ApiClientResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  clients: ApiClient[]
}

export interface ApiClientFilterParams {
  clientId?: number
  s?: string // signature param
  pageNum?: number
  resultsPerPage?: number
  email?: string
  fname?: string
  lname?: string
  keywords?: string
  phone?: string
  showEstimates?: boolean
}

export interface ApiClientEstimateResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  estimates: EstimateData[]
}
