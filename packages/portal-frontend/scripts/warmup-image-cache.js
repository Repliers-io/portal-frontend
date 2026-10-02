/**
 * Post-start script: warms the Next.js /_next/image cache for all images
 * found in public/<tenant>/.
 *
 * Next.js image optimisation is on-demand — the first request triggers Sharp
 * and writes the result to .next/cache/images/. Subsequent requests are served
 * from that cache.  Running this script right after `next start` pre-fills the
 * cache so real users never experience the first-hit latency.
 *
 * On Heroku it runs in the background of the `web` process (see Procfile),
 * pointed at http://localhost:$PORT so each dyno warms its own cache. Because
 * it starts alongside `next start`, it first polls the server until it accepts
 * connections (see waitForServer) before issuing any warm-up request.
 *
 * Usage:
 *   node scripts/warmup-image-cache.js [tenant] [baseUrl]
 *   node scripts/warmup-image-cache.js [baseUrl]
 *
 * Arguments (optional, fall back to env):
 *   tenant   — e.g. "repliers". Defaults to NEXT_PUBLIC_APP_CONFIGURATION.
 *              If the first argument looks like a URL, it is treated as baseUrl.
 *   baseUrl  — e.g. "http://localhost:3000". Defaults to NEXT_PUBLIC_APP_DOMAIN
 *              or http://localhost:3000 when neither is set.
 *
 * Examples:
 *   node scripts/warmup-image-cache.js repliers http://localhost:3000
 *   node scripts/warmup-image-cache.js http://localhost:5000
 *   NEXT_PUBLIC_APP_CONFIGURATION=polsinello node scripts/warmup-image-cache.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rootDir = path.resolve(dirname, '..')

const firstArg = process.argv[2]?.trim() || ''
const secondArg = process.argv[3]?.trim() || ''
const firstArgLooksLikeUrl =
  firstArg.startsWith('http://') ||
  firstArg.startsWith('https://') ||
  firstArg.startsWith('localhost:') ||
  firstArg.startsWith('127.0.0.1:')

const tenant =
  (!firstArgLooksLikeUrl ? firstArg : '') ||
  String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim()

if (!tenant) {
  console.error(
    'Error: tenant name is required.\n' +
      'Pass it as the first argument or set NEXT_PUBLIC_APP_CONFIGURATION.'
  )
  process.exit(1)
}

const rawBaseUrl =
  (firstArgLooksLikeUrl ? firstArg : secondArg) ||
  String(process.env.NEXT_PUBLIC_APP_DOMAIN || '').trim() ||
  'http://localhost:3000'

const baseUrl = rawBaseUrl.replace(/\/$/, '').startsWith('http')
  ? rawBaseUrl.replace(/\/$/, '')
  : `https://${rawBaseUrl.replace(/\/$/, '')}`

// Next.js default deviceSizes + imageSizes (no custom overrides in next.config.js)
const ALL_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840
]
const QUALITY = 75
const CONCURRENCY = 1
const SERVER_READY_TIMEOUT_MS = 180000
const SERVER_POLL_INTERVAL_MS = 1000

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.avif'
])

/**
 * Returns widths that make sense for an image of a given intrinsic width.
 * Next.js won't upscale, so warming w=1920 for a 160px logo is pointless.
 * We allow up to 2x intrinsic width to cover 2x DPR screens.
 */
async function widthsForImage(filePath) {
  try {
    const { width } = await sharp(filePath).metadata()
    if (!width) return ALL_WIDTHS
    const maxWidth = width * 2
    return ALL_WIDTHS.filter((w) => w <= maxWidth)
  } catch {
    return ALL_WIDTHS
  }
}

/** Recursively collect all image files under a directory. */
function collectImages(dir) {
  if (!fs.existsSync(dir)) return []
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath))
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath)
    }
  }
  return results
}

/**
 * Returns all folder names under src/configs/ — these are known tenant names.
 * Same logic as prepare-public.js: any public/ subfolder NOT in this list is "shared".
 */
function getAllTenants() {
  const configsDir = path.join(rootDir, 'src', 'configs')
  try {
    return new Set(
      fs
        .readdirSync(configsDir)
        .filter((item) =>
          fs.statSync(path.join(configsDir, item)).isDirectory()
        )
    )
  } catch {
    return new Set()
  }
}

/**
 * Collects images for the current tenant + all shared (non-tenant) public subfolders.
 * Mirrors the keep logic from prepare-public.js.
 */
function collectTenantImages(publicDir, tenant) {
  const allTenants = getAllTenants()
  const results = []

  for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const isTenant = allTenants.has(entry.name)
    const isCurrentTenant = entry.name === tenant
    // Include: current tenant folder + all non-tenant (shared) folders
    // if (isCurrentTenant || !isTenant) {
    if (isCurrentTenant) {
      const label = isCurrentTenant ? 'tenant' : 'shared'
      console.log(`  [${label}] ${entry.name}/`)
      results.push(...collectImages(path.join(publicDir, entry.name)))
    }
  }
  return results
}

/** Convert an absolute file path inside public/ to a URL path. */
function toPublicPath(filePath) {
  const publicDir = path.join(rootDir, 'public')
  const relative = path.relative(publicDir, filePath).replace(/\\/g, '/')
  return `/${relative}`
}

/** Run tasks with a fixed concurrency limit. */
async function pool(tasks, concurrency) {
  const results = []
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      results[current] = await tasks[current]()
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

/**
 * Polls the base URL until the server accepts connections. The warm-up runs
 * alongside `next start`, so the server may still be booting when we begin.
 * Any HTTP response (even an error status) means the server is up. Returns
 * false if the server is still unreachable after the timeout.
 */
async function waitForServer(url) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: 'HEAD' })
      return true
    } catch {
      await new Promise((resolve) =>
        setTimeout(resolve, SERVER_POLL_INTERVAL_MS)
      )
    }
  }
  return false
}

async function warmImage(publicPath, width) {
  const url = `${baseUrl}/_next/image?url=${encodeURIComponent(publicPath)}&w=${width}&q=${QUALITY}`
  try {
    const res = await fetch(url, { method: 'GET' })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}

async function main() {
  const publicDir = path.join(rootDir, 'public')

  console.log(`Scanning public/ folders for tenant: ${tenant}`)
  const images = collectTenantImages(publicDir, tenant)

  if (images.length === 0) {
    console.warn(`No images found in public/${tenant}/`)
    process.exit(0)
  }

  console.log(`Warming image cache for tenant: ${tenant}`)
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Images found: ${images.length}`)
  console.log()

  // Resolve applicable widths per image using intrinsic dimensions
  const imageWidths = await Promise.all(
    images.map(async (imagePath) => {
      const widths = await widthsForImage(imagePath)
      const publicPath = toPublicPath(imagePath)
      const intrinsicWidth =
        widths.length > 0 ? Math.round(Math.max(...widths) / 2) : '?'
      console.log(
        `  ${publicPath}  (intrinsic ≈${intrinsicWidth}px → widths: ${widths.join(', ')})`
      )
      return { publicPath, widths }
    })
  )
  console.log()

  const total = imageWidths.reduce((sum, { widths }) => sum + widths.length, 0)
  const smallCount = imageWidths.filter(
    ({ widths }) => Math.max(...widths) <= 384
  ).length
  const largeCount = imageWidths.length - smallCount
  console.log(
    `  small (<=384px): ${smallCount}  large (>=640px): ${largeCount}`
  )
  console.log(`Total requests: ${total}`)
  console.log()

  console.log(`Waiting for server at ${baseUrl} ...`)
  const ready = await waitForServer(baseUrl)
  if (!ready) {
    console.warn(`Server not reachable after timeout — skipping warm-up.`)
    process.exit(0)
  }
  console.log('Server is up — starting warm-up.')
  console.log()

  let done = 0
  let errors = 0

  const tasks = imageWidths.flatMap(({ publicPath, widths }) =>
    widths.map((width) => async () => {
      const result = await warmImage(publicPath, width)
      done++
      if (!result.ok) {
        errors++
        if (result.status !== 400) {
          // 400 = unsupported width, not a real error
          console.warn(`  WARN ${result.status} — ${publicPath} w=${width}`)
        }
      }
      if (done % 20 === 0 || done === total) {
        const pct = Math.round((done / total) * 100)
        process.stdout.write(
          `\r  Progress: ${done}/${total} (${pct}%)  errors: ${errors}`
        )
      }
      return result
    })
  )

  await pool(tasks, CONCURRENCY)

  console.log()
  console.log()
  console.log(`Done. ${done - errors}/${total} requests succeeded.`)
  if (errors > 0) {
    console.warn(`${errors} requests failed — check the output above.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
