import queryString from 'query-string'

import {
  type AuthCallbackRequest,
  type AuthCallbackResponse,
  type AuthProvider,
  type AuthResponse,
  type LogInRequest,
  type LogoutResponse,
  type RefreshResponse,
  type SignUpRequest
} from 'services/API'

import { APIBase } from './APIBase'

type BooleanResponse = { result: boolean }
const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

class APIAuthClass extends APIBase {
  auth(provider: AuthProvider): Promise<AuthResponse> {
    const params = queryString.stringify({
      redirect_uri: `${baseUrl}/auth/${provider}/processing`
    })
    return this.fetchJSON<AuthResponse>(`/auth/${provider}/url?${params}`)
  }

  private authCallbackPath(provider: AuthProvider) {
    const params = queryString.stringify({
      redirect_uri: `${baseUrl}/auth/${provider}/processing`
    })
    switch (provider) {
      case 'otp':
        return `/auth/${provider}`
      default:
        return `/auth/${provider}/cb?${params}`
    }
  }

  authCallback(
    provider: AuthProvider,
    body: AuthCallbackRequest
  ): Promise<AuthCallbackResponse> {
    return this.fetchJSON<AuthCallbackResponse>(
      this.authCallbackPath(provider),
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    )
  }

  refresh() {
    return this.fetchJSON<RefreshResponse>('/auth/refresh', {
      method: 'POST'
    })
  }

  logout() {
    return this.fetchJSON<LogoutResponse>('/auth/logout', {
      method: 'POST'
    })
  }

  signup(data: SignUpRequest) {
    return this.fetchJSON<BooleanResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  login(data: LogInRequest) {
    return this.fetchJSON<BooleanResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  confirmOtp(code: string) {
    return this.fetchJSON<AuthCallbackResponse>('/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // TODO: discuss with backenders why do we need additional { result } wrapper here
  tokenLogin(token: string) {
    return this.fetchJSON<{ result: AuthCallbackResponse }>(
      '/auth/repliers-token',
      {
        method: 'POST',
        body: JSON.stringify({ token })
      }
    )
  }
}

export const APIAuth = new APIAuthClass()
