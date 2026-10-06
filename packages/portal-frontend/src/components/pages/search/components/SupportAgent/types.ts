// 1. List of possible message types
export type AgentMessageType =
  | 'AgentReady'
  | 'AgentError'
  | 'OpenListing'
  | 'CloseListing'
  | 'ResetAgent'
  | 'RequestListings'
  | 'ExtractFilters'
  | 'ApplyFilters'
  | 'InitSession'
  | 'WindowVisible'
  | 'WindowHidden'
  | 'Listings'
  | 'ListingDetails'
  | 'Filters'
  | 'ResetFilters'

// 2. Payload types for all messages
export interface OpenListingPayload {
  mlsNumber: string
  boardId: number
}

export interface ListingsPayload {
  count: number
  listings: unknown[]
  statistics: unknown
}

export interface InitSessionPayload {
  userAgent?: string
  userName?: string
}

export interface ListingDetailsPayload {
  listing: unknown
}

export interface ExtractFiltersPayload {
  query?: string
}

export interface ApplyFiltersPayload {
  filters: unknown
}

export interface FiltersPayload {
  filters: unknown
}

export interface AgentErrorPayload {
  error: string
  message?: string
}

// 3. Message type to payload mapping (single source of truth)
export type AgentMessagePayloadMap = {
  AgentReady: undefined
  AgentError: AgentErrorPayload
  WindowVisible: undefined
  WindowHidden: undefined
  OpenListing: OpenListingPayload
  CloseListing: undefined
  RequestListings: undefined
  ExtractFilters: ExtractFiltersPayload
  ApplyFilters: ApplyFiltersPayload
  InitSession: InitSessionPayload
  Listings: ListingsPayload
  ListingDetails: ListingDetailsPayload
  Filters: FiltersPayload
  ResetFilters: undefined
  ResetAgent: undefined
}

// 4. All possible messages and their payloads (WITHOUT sessionId)
export type AgentMessageInput = {
  [K in AgentMessageType]: AgentMessagePayloadMap[K] extends undefined
    ? { type: K }
    : { type: K; payload: AgentMessagePayloadMap[K] }
}[AgentMessageType]

// 5. Utility to add sessionId
export type WithSessionId<T> = T extends undefined
  ? { sessionId: string }
  : T & { sessionId: string }

// 6. All possible messages with automatically added sessionId
export type AgentMessageData = {
  [K in AgentMessageType]: AgentMessagePayloadMap[K] extends undefined
    ? { type: K; payload: { sessionId: string } }
    : { type: K; payload: WithSessionId<AgentMessagePayloadMap[K]> }
}[AgentMessageType]

// === ADDITIONAL UTILITY TYPES ===

// Extract specific message type for handlers
export type ExtractMessageData<T extends AgentMessageType> = Extract<
  AgentMessageData,
  { type: T }
>

// Handler type for specific message
export type AgentMessageHandler<T extends AgentMessageType> = (
  data: ExtractMessageData<T>
) => void

// Mapping of all handlers (optional)
export type AgentMessageHandlers = {
  [K in AgentMessageType]?: AgentMessageHandler<K>
}

// PostMessage API compatibility
export interface PostMessageData {
  type: AgentMessageType
  payload: unknown
}
