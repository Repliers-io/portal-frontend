import fs from 'fs'

import { createClient } from 'redis'

const TIMEOUT_MS = 1000

// Grace period added on top of the revalidate window before the key is evicted,
// so the entry survives long enough to serve stale-while-revalidate.
const ttlBufferSeconds = 3600

// Read the slug-coupled deployment id baked into the slug at prebuild
// (deployment-id.generated.json). The `slug:` segment keeps this namespace
// disjoint from the previous `portal:<DEPLOYMENT_ID>:` scheme, so the first
// deploy starts clean instead of inheriting mismatched-chunk entries.
let deploymentId = 'local'
try {
  deploymentId =
    JSON.parse(
      fs.readFileSync(
        new URL('./deployment-id.generated.json', import.meta.url),
        'utf8'
      )
    ).id || 'local'
} catch {
  // no file (e.g. dev without prebuild) — fall back to a shared namespace
}
const keyPrefix = `portal:slug:${deploymentId}:`
const revalidatedTagsKey = `${keyPrefix}__revalidated_tags__`

let client = null
let connectionPromise = null
const redisUrl = process.env.REDISCLOUD_URL || process.env.REDIS_URL

async function connect() {
  if (!redisUrl) return null
  if (client?.isReady) return client
  if (connectionPromise) {
    await connectionPromise
    return client?.isReady ? client : null
  }

  client = createClient({ url: redisUrl })
  client.on('error', () => {})

  connectionPromise = client
    .connect()
    .then(() => client)
    .catch(() => {
      client = null
      connectionPromise = null
      return null
    })

  return connectionPromise
}

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis timeout')), TIMEOUT_MS)
    )
  ])
}

// Next stores route-handler bodies (APP_ROUTE) as Buffer and page segment data as
// Map<string, Buffer>. Plain JSON.stringify/parse loses both: a Buffer round-trips
// into `{type:'Buffer',data:[…]}` (served as the string "[object Object]") and a Map
// collapses to `{}`. These keep the round-trip lossless; Buffers use base64 so the
// payload stays compact instead of a multi-KB array of byte literals.
const replacer = (key, value) => {
  if (value instanceof Map) return { __t: 'M', d: [...value] }
  // Buffer.prototype.toJSON has already run, so it arrives as {type:'Buffer',data}.
  if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
    return { __t: 'B', d: Buffer.from(value.data).toString('base64') }
  }
  return value
}

const reviver = (key, value) => {
  if (value && value.__t === 'B') return Buffer.from(value.d, 'base64')
  if (value && value.__t === 'M') return new Map(value.d)
  // Legacy entries written before this fix stored Buffers as raw byte arrays.
  if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
    return Buffer.from(value.data)
  }
  return value
}

export default class CacheHandler {
  constructor(_options) {
    connect().catch(() => {})
  }

  async get(key) {
    const c = await connect()
    if (!c) return null

    try {
      const raw = await withTimeout(c.get(keyPrefix + key))
      if (!raw) return null

      const entry = JSON.parse(raw, reviver)
      if (!entry) return null

      if (entry.tags?.length) {
        const times = await withTimeout(c.hmGet(revalidatedTagsKey, entry.tags))
        for (const timeStr of times) {
          if (timeStr && Number(timeStr) > entry.lastModified) {
            c.unlink(keyPrefix + key).catch(() => {})
            return null
          }
        }
      }

      return entry
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    const c = await connect()
    if (!c) return

    try {
      const entry = {
        value: data,
        lastModified: Date.now(),
        tags: ctx?.tags ?? []
      }

      const serialized = JSON.stringify(entry, replacer)

      // Next puts the revalidate window on ctx.cacheControl for page/route
      // entries; only fetch-cache entries carry it on data. Reading data alone
      // left every page key without a TTL.
      const revalidate = ctx?.cacheControl?.revalidate ?? data?.revalidate

      if (revalidate && Number.isFinite(revalidate) && revalidate > 0) {
        await withTimeout(
          c.setEx(keyPrefix + key, revalidate + ttlBufferSeconds, serialized)
        )
      } else {
        await withTimeout(c.set(keyPrefix + key, serialized))
      }
    } catch {
      // fall through — Next.js uses disk cache as fallback
    }
  }

  async revalidateTag(tags) {
    const c = await connect()
    if (!c) return

    const tagArray = Array.isArray(tags) ? tags : [tags]
    if (!tagArray.length) return

    try {
      const now = String(Date.now())
      const fields = Object.fromEntries(tagArray.map((tag) => [tag, now]))
      await withTimeout(c.hSet(revalidatedTagsKey, fields))
    } catch {
      // fall through
    }
  }

  resetRequestCache() {}
}
