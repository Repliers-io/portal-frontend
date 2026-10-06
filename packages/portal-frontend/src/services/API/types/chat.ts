import { type ApiLocation } from './locations'
import { type ApiCluster } from './search'

export type ApiChatRequestData = {
  body?: { [key: string]: any }
  params?: { [key: string]: string }
  locations?: ApiLocation[]
  count?: number
  statistics?: {
    [key: string]: any
  }
  aggregates?: {
    map: {
      clusters: ApiCluster[]
    }
  }
}

export type ApiChatResponse = {
  nlpId: string
  request: ApiChatRequestData & {
    summary: string
  }
}

export interface ApiMessage {
  sender: 'agent' | 'client'
  agentId: number
  clientId: number
  content: Partial<{
    listings: string[]
    searches: number[]
    message: string
    links: string[]
    pictures: string[]
  }>
  messageId: number
  source: 'bot' | string
  token: string
  delivery: {
    scheduleDateTime: string | null
    sentDateTime: string
    status: 'sent' | 'pending'
  }
}

export interface ApiMessageResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  messages: ApiMessage[]
}
