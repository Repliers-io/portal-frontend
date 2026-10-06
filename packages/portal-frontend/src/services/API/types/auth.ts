export type AuthProvider = 'google' | 'facebook' | 'otp'

export interface ApiUserProfile {
  clientId: number
  agentId: number | null
  fname: string
  lname: string
  phone: string | null
  email: string
  proxyEmail: string
  status: boolean
  lastActivity: string | null
  tags: string[] | null
  communities: string[]
  preferences: {
    email: boolean
    sms: boolean
    unsubscribe?: boolean
    whatsapp?: boolean
  }
  expiryDate: string | null
  searches: string[]
  createdOn: string
  externalId: string
  data?: Record<string, unknown>
}

export interface AuthResponse {
  url: string
}

export interface LogoutResponse {
  message: string
}

export interface AuthCallbackRequest {
  code: string
}

export interface RefreshResponse {
  token: string
}

export interface AuthCallbackResponse {
  profile: ApiUserProfile
  token: string | undefined
}
