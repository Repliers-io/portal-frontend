import {
  type AuthRequest,
  type AuthResponse,
  type PlansAndSurveys,
  type PlansResponse
} from './types'

const baseUrl =
  process.env.PYB_API_URL || 'https://api.protectyourboundaries.ca'
const requestTimeout = 15_000
// Token is valid 24 h — refresh 1 hour early
const tokenTtlMs = 23 * 60 * 60 * 1000

class ProtectYourBoundariesAPIClass {
  private token: string | null = null
  private tokenExpiresAt = 0
  // Prevent concurrent auth requests — reuse the in-flight promise
  private pendingAuth: Promise<string> | null = null

  private credentials(): AuthRequest | null {
    const username = process.env.PYB_USERNAME
    const password = process.env.PYB_PASSWORD
    if (!username || !password) return null
    return { username, password, grant_type: 'password' }
  }

  // ── Auth ───────────────────────────────────────────────────────

  private async authenticate(): Promise<string> {
    if (this.pendingAuth) return this.pendingAuth

    this.pendingAuth = this.doAuthenticate()

    try {
      return await this.pendingAuth
    } finally {
      this.pendingAuth = null
    }
  }

  private async doAuthenticate(): Promise<string> {
    const creds = this.credentials()
    if (!creds)
      throw new Error(
        '[ProtectYourBoundariesAPI] Missing credentials (PYB_USERNAME / PYB_PASSWORD)'
      )

    const body = new URLSearchParams({
      username: creds.username,
      password: creds.password,
      grant_type: creds.grant_type
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

    try {
      const response = await fetch(`${baseUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        cache: 'no-store',
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(
          `[ProtectYourBoundariesAPI] Auth failed: ${response.status}`
        )
      }

      const data: AuthResponse = await response.json()
      this.token = data.access_token
      this.tokenExpiresAt = Date.now() + tokenTtlMs
      return data.access_token
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token
    }
    return this.authenticate()
  }

  // ── HTTP layer ─────────────────────────────────────────────────

  private async fetchJSON<T>(path: string): Promise<T> {
    const token = await this.getToken()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // Vendor explicitly prohibits caching — fetch live on every request
        cache: 'no-store',
        signal: controller.signal
      })

      if (response.status === 401) {
        this.token = null
        this.tokenExpiresAt = 0
        return this.fetchJSONRetry<T>(path)
      }

      if (!response.ok) {
        throw new Error(`[ProtectYourBoundariesAPI] ${response.status} ${path}`)
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async fetchJSONRetry<T>(path: string): Promise<T> {
    const token = await this.getToken()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store',
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(
          `[ProtectYourBoundariesAPI] ${response.status} ${path} (retry)`
        )
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // ── Plans ──────────────────────────────────────────────────────

  async fetchPlans(lat: number, lng: number): Promise<PlansAndSurveys> {
    const params = new URLSearchParams({ Lat: String(lat), Lng: String(lng) })
    const data = await this.fetchJSON<PlansResponse>(
      `/api/getPlansByLatLng?${params.toString()}`
    )
    return {
      plans: data.Plans ?? [],
      geoId: data.Parcel?.[0]?.geo_id ?? null
    }
  }
}

export const ProtectYourBoundariesAPI = new ProtectYourBoundariesAPIClass()
