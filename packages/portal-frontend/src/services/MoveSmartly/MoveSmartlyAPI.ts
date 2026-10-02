import { type Geometry } from 'geojson'
import queryString from 'query-string'

import { logError } from 'utils/log'

import {
  type AgentReviewCreateRequest,
  type AgentReviewModel,
  type AgentReviewsQuery,
  type AgentReviewsSummaryModel,
  type AuthRequest,
  type AuthResponse,
  type Bbox,
  type CareerModel,
  type CondoDevelopment,
  type DirectoryAgentModel,
  type LatLngBounds,
  type ListingInfo,
  type Parcel,
  type Region,
  type ReviewAgentModel,
  type School,
  type SchoolCached,
  type SocialHousing
} from './types'
import { regularBoundary } from './utils'

// ── Boundary bbox helpers ──────────────────────────────────────────

// Extract all [lng, lat] coordinate pairs from a GeoJSON geometry.
// Only Polygon and MultiPolygon are used in school boundaries.
const extractGeometryCoords = (geometry: Geometry): [number, number][] => {
  switch (geometry.type) {
    case 'Polygon':
      return geometry.coordinates[0] as [number, number][]
    case 'MultiPolygon':
      return geometry.coordinates.flatMap((p) => p[0]) as [number, number][]
    default:
      return []
  }
}

// Union bounding box across all boundary polygons of a school.
// Returns null when the school has no parseable boundary data.
const makeBbox = (lngs: number[], lats: number[]): Bbox | null =>
  lngs.length
    ? {
        swLng: Math.min(...lngs),
        neLng: Math.max(...lngs),
        swLat: Math.min(...lats),
        neLat: Math.max(...lats)
      }
    : null

// Compute separate bboxes per catchment language, split by the SAME criterion the
// map uses to render catchment polygons — `boundary.isEnglish`. A regular French-
// language catchment (isEnglish=false, but neither French Immersion nor Extended
// French) must land in frenchBbox: otherwise its polygon shows in French mode while
// the marker carries no French bbox, so clicking it can neither fit nor select the
// polygon the user just hovered.
export const computeSchoolBboxes = (
  school: School
): { englishBbox: Bbox | null; frenchBbox: Bbox | null } => {
  if (!school.boundaries?.length) return { englishBbox: null, frenchBbox: null }
  const enLngs: number[] = []
  const enLats: number[] = []
  const frLngs: number[] = []
  const frLats: number[] = []
  for (const b of school.boundaries) {
    if (!regularBoundary(b) || !b.boundary) continue
    const coords = extractGeometryCoords(b.boundary)
    if (b.isEnglish) {
      for (const [lng, lat] of coords) {
        enLngs.push(lng)
        enLats.push(lat)
      }
    } else {
      for (const [lng, lat] of coords) {
        frLngs.push(lng)
        frLats.push(lat)
      }
    }
  }
  return {
    englishBbox: makeBbox(enLngs, enLats),
    frenchBbox: makeBbox(frLngs, frLats)
  }
}

const baseUrl =
  process.env.MOVESMARTLY_API_URL || 'https://integrations.movesmartly.com'
const cfBypassToken = process.env.CF_BYPASS_TOKEN
const cfBypassHeaders: Record<string, string> = cfBypassToken
  ? { 'x-cf-bypass': cfBypassToken }
  : {}
const requestTimeout = 15_000
// Cache GET responses for 1 hour (listing data doesn't change frequently)
const revalidateSeconds = 3600

// Pretty-print JSON error bodies; pass other payloads through untouched.
const formatBody = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

type MemCacheEntry<T> = { data: T; expiresAt: number }

// Process-global cache shared across all webpack bundles (instrumentation.ts and
// route handlers are separate chunks; globalThis is the only object common to all
// of them within the same Node.js process).
type GlobalStore = {
  memCache?: Map<string, MemCacheEntry<unknown>>
  pendingFetches?: Map<string, Promise<unknown>>
}
const storeSymbol = Symbol.for('MoveSmartly.store')
const getStore = (): Required<GlobalStore> => {
  const g = globalThis as Record<symbol, GlobalStore | undefined>
  const store = (g[storeSymbol] ??= {})
  store.memCache ??= new Map()
  store.pendingFetches ??= new Map()
  return store as Required<GlobalStore>
}

class MoveSmartlyAPIClass {
  private token: string | null = null
  private tokenExpiresAt = 0
  // Prevent concurrent auth requests — reuse the in-flight promise
  private pendingAuth: Promise<string> | null = null

  private memGet<T>(key: string): T | null {
    const { memCache } = getStore()
    const entry = memCache.get(key) as MemCacheEntry<T> | undefined
    if (entry && Date.now() < entry.expiresAt) return entry.data
    memCache.delete(key)
    return null
  }

  private memSet<T>(
    key: string,
    data: T,
    ttlSeconds = revalidateSeconds
  ): void {
    getStore().memCache.set(key, {
      data: data as unknown,
      expiresAt: Date.now() + ttlSeconds * 1000
    })
  }

  private credentials(): AuthRequest | null {
    const email = process.env.MOVESMARTLY_EMAIL
    const password = process.env.MOVESMARTLY_PASSWORD
    if (!email || !password) return null
    return { email, password }
  }

  // ── Auth ───────────────────────────────────────────────────────

  private async authenticate(): Promise<string> {
    // If there's already an in-flight auth request, reuse it
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
        '[MoveSmartlyAPI] Missing credentials (MOVESMARTLY_EMAIL / MOVESMARTLY_PASSWORD)'
      )

    const response = await fetch(`${baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { ...cfBypassHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    })

    if (!response.ok) {
      throw new Error(`[MoveSmartlyAPI] Auth failed: ${response.status}`)
    }

    const data: AuthResponse = await response.json()

    this.token = data.token
    // Cache token for 55 minutes (assuming 1h expiry, refresh early)
    this.tokenExpiresAt = Date.now() + 55 * 60 * 1000
    return data.token
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token
    }
    return this.authenticate()
  }

  // ── HTTP layer ─────────────────────────────────────────────────

  private async fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await this.getToken()
    const isGet = !options?.method || options.method === 'GET'

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...cfBypassHeaders,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        Authorization: `Bearer ${token}`,
        ...options?.headers
      },
      // Next.js fetch cache: revalidate GET requests, skip cache for mutations.
      // If caller passes cache: 'no-store' explicitly (large responses >2 MB),
      // honour it and bypass Next.js data cache entirely.
      ...(options?.cache === 'no-store'
        ? { cache: 'no-store' as const }
        : isGet
          ? { next: { revalidate: revalidateSeconds } }
          : { cache: 'no-store' as const })
    }

    // AbortController timeout only for non-cached (POST) requests
    const controller = !isGet ? new AbortController() : null
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), requestTimeout)
      : null

    if (controller) fetchOptions.signal = controller.signal

    try {
      const fullUrl = `${baseUrl}${path}`
      // console.log('[MoveSmartlyAPI]', fetchOptions.method ?? 'GET', fullUrl, {
      //   headers: fetchOptions.headers,
      //   body: options?.body != null ? JSON.parse(options.body as string) : undefined,
      // })
      const response = await fetch(fullUrl, fetchOptions)

      if (response.status === 401) {
        this.token = null
        this.tokenExpiresAt = 0
        return this.fetchJSONRetry<T>(path, options)
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '(unreadable)')
        const message = `[MoveSmartlyAPI] ${response.status} ${path}\n${formatBody(body)}`
        logError(message)
        throw new Error(message)
      }

      // Some upstream POSTs return 2xx with an empty body (e.g. createAgentReview).
      // Guard against `JSON.parse('')` and return `undefined` for void callers.
      const text = await response.text()
      return (text ? JSON.parse(text) : undefined) as T
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  private async fetchJSONRetry<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const token = await this.getToken()
    const isGet = !options?.method || options.method === 'GET'

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...cfBypassHeaders,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        Authorization: `Bearer ${token}`,
        ...options?.headers
      },
      ...(options?.cache === 'no-store'
        ? { cache: 'no-store' as const }
        : isGet
          ? { next: { revalidate: revalidateSeconds } }
          : { cache: 'no-store' as const })
    }

    const controller = !isGet ? new AbortController() : null
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), requestTimeout)
      : null

    if (controller) fetchOptions.signal = controller.signal

    try {
      const response = await fetch(`${baseUrl}${path}`, fetchOptions)

      if (!response.ok) {
        const body = await response.text().catch(() => '(unreadable)')
        const message = `[MoveSmartlyAPI] ${response.status} ${path} (retry)\n${formatBody(body)}`
        logError(message)
        throw new Error(message)
      }

      const text = await response.text()
      return (text ? JSON.parse(text) : undefined) as T
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  // ── Listing ────────────────────────────────────────────────────

  fetchListing(mlsNumber: string): Promise<ListingInfo> {
    return this.fetchJSON<ListingInfo>(`/api/listing/${mlsNumber}`)
  }

  // ── Parcel ─────────────────────────────────────────────────────

  fetchParcels(bounds: LatLngBounds): Promise<Parcel[]> {
    return this.fetchJSON<Parcel[]>('/api/parcel', {
      method: 'POST',
      body: JSON.stringify({ bounds, maxResults: 1000 })
    })
  }

  // ── Condo Development ──────────────────────────────────────────

  fetchCondoDevelopments(bounds: LatLngBounds): Promise<CondoDevelopment[]> {
    return this.fetchJSON<CondoDevelopment[]>('/api/condo-development', {
      method: 'POST',
      body: JSON.stringify({ bounds, maxResults: 500 })
    })
  }

  // ── Social Housing ─────────────────────────────────────────────

  fetchSocialHousing(bounds: LatLngBounds): Promise<SocialHousing[]> {
    return this.fetchJSON<SocialHousing[]>('/api/social-housing', {
      method: 'POST',
      body: JSON.stringify({ bounds, maxResults: 500 })
    })
  }

  // ── Region ─────────────────────────────────────────────────────
  // Response is ~6-12 MB — too large for Next.js 2 MB fetch cache.
  // Use in-process TTL cache instead.

  async fetchRegions(): Promise<Region[]> {
    const cached = this.memGet<Region[]>('regions')
    if (cached) return cached
    const data = await this.fetchJSON<Region[]>('/api/region', {
      cache: 'no-store'
    })
    this.memSet('regions', data)
    return data
  }

  // ── School ─────────────────────────────────────────────────────
  // Response is ~11 MB — too large for Next.js 2 MB fetch cache.
  // Use in-process TTL cache instead (24 h — data updates weekly/monthly).
  private static readonly schoolsTtlSeconds = 86_400

  async fetchSchools(lastReviewedDate?: string): Promise<SchoolCached[]> {
    // v4: specialty-intake zones (AP/IB/Gifted/Arts/Sport) are excluded from the
    // cached bboxes — in the wire data they carry grade flags, so earlier versions
    // let these board-wide zones inflate the bboxes. The bump invalidates them.
    const key = `schools:v4:${lastReviewedDate ?? ''}`
    const cached = this.memGet<SchoolCached[]>(key)
    if (cached) return cached

    // Deduplicate concurrent in-flight requests (e.g. instrumentation warm-up
    // racing with the first real request — both share the same pending promise
    // so only one HTTP call is made).
    const { pendingFetches } = getStore()
    const inflight = pendingFetches.get(key) as
      | Promise<SchoolCached[]>
      | undefined
    if (inflight) return inflight

    const query = lastReviewedDate
      ? `?LastReviewedDate=${lastReviewedDate}`
      : ''
    const promise = this.fetchJSON<School[]>(`/api/school${query}`, {
      cache: 'no-store'
    }).then(
      (data) => {
        // Pre-compute boundary bboxes once at cache-formation time so that
        // every subsequent request can use O(1) bbox intersection instead of
        // iterating polygon coordinates on the hot path.
        // Full School objects are stored unchanged — all boundaries are kept
        // for future use. Arts/AP boundaries are excluded only during bbox
        // computation (see computeSchoolBbox) and at query time in the route
        // handlers.
        const cached: SchoolCached[] = data.map((s) => ({
          ...s,
          ...computeSchoolBboxes(s)
        }))
        this.memSet(key, cached, MoveSmartlyAPIClass.schoolsTtlSeconds)
        pendingFetches.delete(key)
        return cached
      },
      (err: unknown) => {
        pendingFetches.delete(key)
        throw err
      }
    )

    pendingFetches.set(key, promise)
    return promise
  }

  fetchLatestSchoolReviewDate(): Promise<string | null> {
    return this.fetchJSON<string | null>('/api/school/latestReviewDate')
  }

  // ── Agent ──────────────────────────────────────────────────────────

  fetchCanReviewAgents(): Promise<ReviewAgentModel[]> {
    return this.fetchJSON<ReviewAgentModel[]>('/api/agent/can-review')
  }

  fetchAgentDirectory(): Promise<DirectoryAgentModel[]> {
    return this.fetchJSON<DirectoryAgentModel[]>('/api/agent/directory')
  }

  // ── Agent Reviews ──────────────────────────────────────────────────

  fetchAgentReviews(
    query: AgentReviewsQuery = {}
  ): Promise<AgentReviewModel[]> {
    const qs = queryString.stringify(
      { AgentId: query.agentId, Take: query.take, Skip: query.skip },
      { skipNull: true, skipEmptyString: true }
    )
    const path = `/api/agent-reviews${qs ? `?${qs}` : ''}`
    return this.fetchJSON<AgentReviewModel[]>(path)
  }

  createAgentReview(data: AgentReviewCreateRequest): Promise<void> {
    // Upstream expects PascalCase keys.
    const upstreamBody = {
      MemberRepliersId: data.memberRepliersId,
      AgentId: data.agentId,
      Rating: data.rating,
      BoughtSold: data.boughtSold,
      Comments: data.comments,
      MemberDisplayName: data.memberDisplayName,
      Neighbourhood: data.neighbourhood,
      Address: data.address,
      PostIpAddress: data.postIpAddress
    }
    return this.fetchJSON<void>('/api/agent-reviews', {
      method: 'POST',
      body: JSON.stringify(upstreamBody)
    })
  }

  fetchAgentReviewsSummary(
    agentId?: number
  ): Promise<AgentReviewsSummaryModel> {
    const qs = queryString.stringify(
      { AgentId: agentId },
      { skipNull: true, skipEmptyString: true }
    )
    const path = `/api/agent-reviews/summary${qs ? `?${qs}` : ''}`
    return this.fetchJSON<AgentReviewsSummaryModel>(path)
  }

  // ── Career ─────────────────────────────────────────────────────────

  fetchCareers(): Promise<CareerModel[]> {
    return this.fetchJSON<CareerModel[]>('/api/career')
  }
}

export const MoveSmartlyAPI = new MoveSmartlyAPIClass()
