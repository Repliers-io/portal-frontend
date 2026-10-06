/**
 * Post-deploy script: deletes Redis cache keys that belong to previous
 * Heroku deploys.
 *
 * The Next.js ISR cache handler (cache-handler.js) namespaces every key with
 * the deployment id (the slug commit, written to deployment-id.generated.json
 * at prebuild):
 *
 *     portal:slug:<deploymentId>:<path>
 *
 * Each deploy gets a new id and most keys carry no TTL, so a deploy leaves the
 * previous deploy's keys behind. This script runs in the Heroku release phase
 * (see Procfile) and removes every `portal:*` key whose prefix does NOT match
 * the current deploy (this also clears the legacy `portal:<DEPLOYMENT_ID>:`
 * keys from before the slug-based scheme).
 *
 * Failures never block the deploy — we always exit 0.
 *
 * Usage:
 *   REDISCLOUD_URL=redis://... node scripts/cleanup-redis-cache.js
 */

import fs from 'fs'

import { createClient } from 'redis'

const tag = '[cleanup-redis-cache]'

async function main() {
  const redisUrl = process.env.REDISCLOUD_URL || process.env.REDIS_URL
  if (!redisUrl) {
    console.log(`${tag} no Redis URL set, skipping.`)
    process.exit(0)
  }

  let deploymentId = null
  try {
    deploymentId = JSON.parse(
      fs.readFileSync(
        new URL('../deployment-id.generated.json', import.meta.url),
        'utf8'
      )
    ).id
  } catch {
    // no file — skip below
  }
  if (!deploymentId) {
    console.log(`${tag} deployment id not found, skipping.`)
    process.exit(0)
  }

  const keepPrefix = `portal:slug:${deploymentId}:`
  console.log(`${tag} keeping keys with prefix "${keepPrefix}"`)

  const client = createClient({
    url: redisUrl,
    socket: { connectTimeout: 10_000 }
  })
  client.on('error', (err) => {
    console.error(`${tag} redis error: ${err?.message ?? err}`)
  })

  console.log(`${tag} connecting to Redis...`)
  await client.connect()
  console.log(`${tag} connected.`)

  // Iterate the keyspace with SCAN (non-blocking, incremental) rather than
  // KEYS-in-EVAL: a single KEYS over a large keyspace blocks the server and the
  // atomic Lua can outlive the client's socket timeout. UNLINK frees memory on a
  // background thread; batching the stale keys per scan step keeps round-trips low.
  let scanned = 0
  let deleted = 0
  for await (const keys of client.scanIterator({
    MATCH: 'portal:*',
    COUNT: 500
  })) {
    scanned += keys.length
    const stale = keys.filter((k) => !k.startsWith(keepPrefix))
    if (stale.length) deleted += await client.unlink(stale)
  }
  console.log(
    `${tag} scanned ${scanned} portal keys, unlinked ${deleted} stale keys`
  )

  await client.quit()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`${tag} failed: ${err?.message ?? err}`)
    process.exit(0)
  })
