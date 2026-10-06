// ── Category allowlist ───────────────────────────────────────────
// Server-side whitelist prevents arbitrary upstream paths.

export type Category = 'grocery' | 'bus' | 'subway' | 'train'

const categories: readonly Category[] = ['grocery', 'bus', 'subway', 'train']

export const parseCategories = (raw: string | null): Category[] | null => {
  if (!raw) return null
  const parts = raw.split(',').map((s) => s.trim())
  if (
    parts.length === 0 ||
    !parts.every((p) => categories.includes(p as Category))
  )
    return null
  return parts as Category[]
}

// ── Geometry parsing ──────────────────────────────────────────────

export type Bbox = {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

const finiteInRange = (v: number, min: number, max: number): boolean =>
  isFinite(v) && v >= min && v <= max

// Accepts "minLng,minLat,maxLng,maxLat".
export const parseBbox = (raw: string | null): Bbox | null => {
  if (!raw) return null
  const parts = raw.split(',').map(Number)
  if (parts.length !== 4) return null
  const [minLng, minLat, maxLng, maxLat] = parts
  if (
    !finiteInRange(minLng, -180, 180) ||
    !finiteInRange(maxLng, -180, 180) ||
    !finiteInRange(minLat, -90, 90) ||
    !finiteInRange(maxLat, -90, 90) ||
    minLng >= maxLng ||
    minLat >= maxLat
  ) {
    return null
  }
  return { minLng, minLat, maxLng, maxLat }
}

// Accepts "lng,lat".
export const parseProximity = (raw: string | null): [number, number] | null => {
  if (!raw) return null
  const parts = raw.split(',').map(Number)
  if (parts.length !== 2) return null
  const [lng, lat] = parts
  if (!finiteInRange(lng, -180, 180) || !finiteInRange(lat, -90, 90)) {
    return null
  }
  return [lng, lat]
}

export const parseLimit = (raw: string | null, max: number): number => {
  if (!raw) return Math.min(25, max)
  const n = Number(raw)
  if (!isFinite(n) || n < 1) return Math.min(25, max)
  return Math.min(Math.floor(n), max)
}

// ── Normalized response ───────────────────────────────────────────

export type NormalizedPoiProps = {
  id: string
  name: string
  address: string | null
  category: Category
}

export type NormalizedPoi = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: NormalizedPoiProps
}

export type NormalizedCollection = {
  type: 'FeatureCollection'
  features: NormalizedPoi[]
}

// ── In-memory cache ───────────────────────────────────────────────
// Keyed by category + rounded bbox. TTL 10 min.
// Keeps at most 200 entries — evicts oldest on insert.

type CacheEntry = { expires: number; value: NormalizedCollection }

const cache = new Map<string, CacheEntry>()
const ttlMs = 10 * 60 * 1000
const maxEntries = 200

const roundBbox = (b: Bbox) =>
  [b.minLng, b.minLat, b.maxLng, b.maxLat].map((n) => n.toFixed(3)).join(',')

export const cacheKey = (categories: Category[], bbox: Bbox, limit: number) =>
  `${[...categories].sort().join(',')}|${roundBbox(bbox)}|${limit}`

export const cacheGet = (key: string): NormalizedCollection | null => {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export const cacheSet = (key: string, value: NormalizedCollection) => {
  if (cache.size >= maxEntries) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { expires: Date.now() + ttlMs, value })
}
