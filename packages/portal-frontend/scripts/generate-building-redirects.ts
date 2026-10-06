/**
 * Generates redirects-buildings.generated.json with all CMS building URLs.
 *
 * Fetches two URL trees from WordPress:
 *   - Building groups (custom post type "buildings") → source is WP permalink
 *   - Individual buildings (WP categories referenced via ACF) → source is WP permalink
 *
 * Then fetches all buildings from the Repliers API (via NEXT_PUBLIC_API_URL proxy)
 * and tries to match WP category slugs against Repliers building slugs.
 * Matched individual buildings get their destination auto-filled as the 5-segment canonical URL
 * (<route>/<city>/<hood>/<addressSlug-id>/<name>) — the same form the sitemap + getBuildingUrl use.
 * Groups and unmatched buildings stay with an empty destination.
 *
 * Output:
 *   redirects-buildings.generated.json  (in portal-frontend root)
 *
 * Usage:
 *   tsx scripts/generate-building-redirects.ts            # uses NEXT_PUBLIC_APP_CONFIGURATION from .env
 *   tsx scripts/generate-building-redirects.ts urbn       # explicit instance
 *
 * Note: the Repliers API proxy (NEXT_PUBLIC_API_URL) must be reachable at match time.
 *       If it is unavailable all destinations fall back to empty strings.
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// ─── Instance ─────────────────────────────────────────────────────────────────

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

const instanceName =
  process.argv[2]?.trim() ||
  String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim() ||
  'defaults'

const instanceEnvFile = path.join(rootDir, `.env.${instanceName}`)
if (fs.existsSync(instanceEnvFile)) {
  dotenv.config({ path: instanceEnvFile, override: true, quiet: true })
}

// ─── ANSI colours ─────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  grey: '\x1b[90m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

console.log(
  `\n  generate-building-redirects  ${c.grey}instance:${c.reset} ${instanceName}\n`
)

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Read routes.condo from the tenant config file (src/configs/<instance>/routes.ts).
 * Falls back to the default if the tenant has no override or the field is absent.
 */
function resolveLocationBuildingRoute(): string {
  const defaultRoute = '/condo'
  const tenantRoutesFile = path.join(
    rootDir,
    'src',
    'configs',
    instanceName,
    'routes.ts'
  )
  if (!fs.existsSync(tenantRoutesFile)) return defaultRoute
  const content = fs.readFileSync(tenantRoutesFile, 'utf8')
  const match = content.match(/condo:\s*['"]([^'"]+)['"]/)
  return match ? match[1] : defaultRoute
}

const locationBuildingRoute = resolveLocationBuildingRoute()
if (locationBuildingRoute !== '/condo') {
  console.log(
    `  route      ${c.grey}${locationBuildingRoute}${c.reset} (tenant override)\n`
  )
}

// ─── WordPress config ─────────────────────────────────────────────────────────

const wpBaseUrl = (process.env.WORDPRESS_API_URL || '').replace(/\/$/, '')
const wpUser = process.env.WORDPRESS_API_USER
const wpPassword = process.env.WORDPRESS_API_PASSWORD
const wpApiKey =
  wpUser && wpPassword
    ? `${wpUser}:${wpPassword}`
    : process.env.WORDPRESS_API_KEY
const wpApplicationName = process.env.WORDPRESS_API_APPLICATION_NAME

if (!wpBaseUrl) {
  console.error(
    `  ${c.red}error:${c.reset} WORDPRESS_API_URL is not set for instance "${instanceName}"\n` +
      `         Set it in .env.${instanceName} or .env\n`
  )
  process.exit(1)
}

const isWordPressCom = wpBaseUrl.includes('wordpress.com')

console.log(`  WordPress  ${c.grey}${wpBaseUrl}${c.reset}`)
console.log(
  `  auth       ${c.grey}${wpApiKey ? (wpApiKey.includes(':') ? 'Basic (user:password)' : 'Bearer token') : 'none (public)'}${c.reset}\n`
)

// ─── HTTP helpers ──────────────────────────────────────────────────────────────

function getApiUrl(endpoint: string): string {
  if (isWordPressCom) {
    const siteDomain = wpBaseUrl.replace(/^https?:\/\//, '')
    return `https://public-api.wordpress.com/wp/v2/sites/${siteDomain}${endpoint}`
  }
  return `${wpBaseUrl}/wp-json/wp/v2${endpoint}`
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (wpApiKey) {
    if (wpApiKey.includes(':')) {
      headers['Authorization'] =
        `Basic ${Buffer.from(wpApiKey).toString('base64')}`
    } else {
      headers['Authorization'] = `Bearer ${wpApiKey}`
    }
  }

  if (wpApplicationName) {
    headers['X-WP-Application-Name'] = wpApplicationName
  }

  return headers
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BuildingCategory {
  id: number
  slug: string
  link: string // full canonical WP URL, e.g. https://site.com/building/the-tower/
  acf?: { template?: string | false }
}

interface RepliersBuilding {
  id: number
  slug?: string
  name?: string
  buildingName?: string
  details?: { buildingName?: string }
  address?: {
    area?: string
    city?: string
    neighborhood?: string
    streetNumber?: string
    streetName?: string
  }
}

interface RedirectEntry {
  source: string
  destination: string
  permanent: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the pathname from a full URL, stripping trailing slash.
 * Returns '' on parse failure.
 */
function extractPath(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/$/, '') || '/'
  } catch {
    return ''
  }
}

/**
 * Convert a building name to a URL slug the same way WordPress does:
 * lowercase, collapse non-alphanumeric runs to a single hyphen, trim edges.
 * e.g. "The King's Landing" → "the-kings-landing"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Mirrors sanitizeUrl from src/utils/urls.ts.
 * Replaces hyphens with non-breaking hyphens, spaces with hyphens, lowercases, then encodeURIComponent.
 */
function sanitizeUrl(str: string): string {
  return encodeURIComponent(
    str
      .replaceAll('-', '\u2011') // replace minus with NON-BREAKING HYPHEN
      .replaceAll(' ', '-')
      .toLowerCase()
  )
}

/**
 * Mirrors sanitizeAddress from src/utils/listings/sanitizers.ts (street-number + street-name only).
 */
function sanitizeAddressSlug(streetNumber = '', streetName = ''): string {
  return [streetNumber, streetName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/#/g, '')
    .replace(/[.\/\\'`]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * Mirrors getBuildingUrl + getLocationBuildingsUrl from components/pages/condos/utils.ts.
 * Uses the resolved locationBuilding route for the current instance.
 *
 * Produces the 5-segment canonical form `<route>/<city>/<hood>/<addressSlug-id>/<name>` — the same
 * URL the sitemap + internal links (getBuildingUrl) emit — so a matched old URL 301s straight to the
 * indexed page instead of the name-only 4-segment form (which would then need a canonical hop to
 * consolidate). Area segment omitted — depends on per-tenant locationConfig.showAreas, unavailable here.
 */
function buildLocationBuildingUrl(b: RepliersBuilding): string {
  const { city, neighborhood, streetNumber, streetName } = b.address || {}
  const addressSlug = b.slug || sanitizeAddressSlug(streetNumber, streetName)
  const displaySlug = b.id ? `${addressSlug}-${b.id}` : addressSlug
  const buildingName = b.details?.buildingName || b.name || b.buildingName

  const parts: string[] = []
  if (city) parts.push(sanitizeUrl(city))
  if (neighborhood) parts.push(sanitizeUrl(neighborhood))
  // Address segment is already sanitized by sanitizeAddressSlug — don't double-encode it.
  if (displaySlug) parts.push(displaySlug)
  if (buildingName) parts.push(sanitizeUrl(buildingName))

  return `${locationBuildingRoute}/${parts.join('/')}`
}

// ─── Fetchers ──────────────────────────────────────────────────────────────────

/**
 * Fetch ALL WordPress categories with acf.template === "building", paginated.
 * This is the authoritative source — replaces the ACF-groups discovery approach.
 */
async function fetchAllBuildingCategories(): Promise<BuildingCategory[]> {
  const all: BuildingCategory[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      context: 'edit',
      _fields: 'id,slug,link,acf'
    })

    const url = getApiUrl(`/categories?${params}`)

    process.stdout.write(
      `  ${c.grey}all categories page ${page}${c.reset}  fetching... `
    )

    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `WordPress API error ${response.status} ${response.statusText}\n  URL: ${url}\n  Body: ${body.slice(0, 200)}`
      )
    }

    const totalPages = response.headers.get('X-WP-TotalPages')
    const items: BuildingCategory[] = await response.json()
    const buildings = items.filter((item) => item.acf?.template === 'building')
    process.stdout.write(
      `${c.green}${items.length} categories, ${buildings.length} buildings${c.reset}\n`
    )
    all.push(...buildings)

    if (items.length < perPage) break
    if (totalPages && page >= Number(totalPages)) break
    page++
  }

  return all
}

// ─── Repliers buildings fetch ────────────────────────────────────────────────

/**
 * Fetch all buildings from the Repliers API proxy and return a Map of
 * slugified-buildingName → full destination URL.
 * Returns an empty Map if the proxy is unreachable or returns an error.
 */
async function fetchRepliersUrlMap(): Promise<Map<string, string>> {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

  if (!apiBase) {
    console.log(
      `  ${c.yellow}skip:${c.reset} NEXT_PUBLIC_API_URL not set — Repliers matching disabled\n`
    )
    return new Map()
  }

  const allBuildings: RepliersBuilding[] = []
  let pageNum = 1
  const resultsPerPage = 100

  process.stdout.write(`  ${c.grey}Repliers buildings${c.reset}  fetching... `)

  try {
    while (true) {
      const params = new URLSearchParams({
        pageNum: String(pageNum),
        resultsPerPage: String(resultsPerPage),
        class: 'condo',
        minStories: '4'
      })

      const response = await fetch(`${apiBase}/api/buildings?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          // Machine traffic: identify as a build so the backend uses the
          // cache-warmup key instead of reporting us as an end user.
          ...(process.env.NEXT_SSG_REQUEST_TOKEN && {
            'X-Forwarded-For-Token': process.env.NEXT_SSG_REQUEST_TOKEN
          })
        }
      })

      if (!response.ok) {
        process.stdout.write(
          `${c.yellow}${response.status} — skipping\n${c.reset}`
        )
        return new Map()
      }

      const data: { buildings: RepliersBuilding[]; numPages: number } =
        await response.json()

      allBuildings.push(...data.buildings)

      if (pageNum >= data.numPages) break
      pageNum++
    }

    // Sort by id ascending so collisions are resolved deterministically
    // (lowest id wins when multiple buildings share the same buildingName slug)
    allBuildings.sort((a, b) => a.id - b.id)

    const urlMap = new Map<string, string>()
    allBuildings.forEach((b) => {
      const buildingName = b.details?.buildingName || b.name || b.buildingName
      if (buildingName && !urlMap.has(slugify(buildingName))) {
        urlMap.set(slugify(buildingName), buildLocationBuildingUrl(b))
      }
    })

    process.stdout.write(`${c.green}${urlMap.size} buildings${c.reset}\n`)
    return urlMap
  } catch (err) {
    process.stdout.write(
      `${c.yellow}unreachable (${(err as Error).message}) — skipping${c.reset}\n`
    )
    return new Map()
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

console.log(
  `  ${c.grey}all categories (filtered by acf.template = "building")${c.reset}`
)
const buildings = await fetchAllBuildingCategories()

console.log(`\n  ${c.cyan}fetched:${c.reset} ${buildings.length} buildings\n`)

console.log(`  ${c.grey}Repliers match${c.reset}`)
const repliersUrlMap = await fetchRepliersUrlMap()

// ─── Build entries ─────────────────────────────────────────────────────────────

// Individual buildings only: match WP category slug against slugified Repliers buildingName.
// Groups have no Repliers equivalent and are not included in the output.
let matched = 0
const entries: RedirectEntry[] = buildings
  .map((b) => {
    const source = extractPath(b.link)
    if (!source || source === '/') return null

    // WP slug mirrors what WordPress generated from the building name
    const destination =
      repliersUrlMap.size > 0 && repliersUrlMap.has(b.slug)
        ? (repliersUrlMap.get(b.slug) as string)
        : ''

    if (destination) matched++
    return { source, destination, permanent: true }
  })
  .filter((e): e is RedirectEntry => e !== null)

// Stable alphabetical order for clean git diffs
entries.sort((a, b) => a.source.localeCompare(b.source))

const autoFilled = matched
const empty = entries.length - autoFilled

console.log(
  `\n  ${c.cyan}entries:${c.reset} ${entries.length} total` +
    (repliersUrlMap.size > 0
      ? `  ${c.green}${autoFilled} auto-filled${c.reset}  ${c.yellow}${empty} empty${c.reset}`
      : '') +
    '\n'
)

const outputPath = path.join(
  rootDir,
  'src',
  'configs',
  instanceName,
  'redirects-buildings.ts'
)

const matchedEntries = entries

const lines = matchedEntries.map((e, i) =>
  [
    `  {`,
    `    source: ${JSON.stringify(e.source)},`,
    `    destination: ${JSON.stringify(e.destination)},`,
    `    permanent: ${e.permanent}`,
    `  }${i < matchedEntries.length - 1 ? ',' : ''}`
  ].join('\n')
)

const tsContent = [
  `// Auto-generated by scripts/generate-building-redirects.ts`,
  `// Run: pnpm generate:building-redirects ${instanceName}`,
  `// Do not edit manually.`,
  ``,
  `const redirects: { source: string; destination: string; permanent: boolean }[] = [`,
  ...lines,
  `]`,
  ``,
  `export default redirects`,
  ``
].join('\n')

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, tsContent)

console.log(
  `  ${c.green}✓${c.reset} wrote ${path.relative(rootDir, outputPath)}  (${matchedEntries.length} entries)\n` +
    (empty > 0
      ? `  ${c.yellow}note:${c.reset} ${empty} unmatched — add them manually to redirects-buildings-manual.ts\n`
      : '')
)
