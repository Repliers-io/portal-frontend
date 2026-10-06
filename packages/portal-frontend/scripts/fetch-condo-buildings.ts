/**
 * Fetches all location condo buildings from the Repliers API proxy
 * and outputs a sorted JSON array to stdout.
 *
 * Usage:
 *   tsx scripts/fetch-condo-buildings.ts urbn
 *   tsx scripts/fetch-condo-buildings.ts urbn > buildings.json
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

const instanceName =
  process.argv[2]?.trim() ||
  String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim() ||
  'defaults'

const instanceEnvFile = path.join(rootDir, `.env.${instanceName}`)
if (fs.existsSync(instanceEnvFile)) {
  dotenv.config({ path: instanceEnvFile, override: true, quiet: true })
}

const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

if (!apiBase) {
  console.error('NEXT_PUBLIC_API_URL is not set')
  process.exit(1)
}

interface Building {
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

// Mirrors sanitizeUrl from src/utils/urls.ts
function sanitizeUrl(str: string): string {
  return encodeURIComponent(
    str.replaceAll('-', '\u2011').replaceAll(' ', '-').toLowerCase()
  )
}

// Mirrors sanitizeAddress from src/utils/listings/sanitizers.ts (street number + name only)
function sanitizeAddressSlug(streetNumber = '', streetName = ''): string {
  return [streetNumber, streetName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/#/g, '')
    .replace(/[./\\'`]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// Mirrors getBuildingUrl from src/components/pages/condos/utils.ts (urbn: showAreas=false)
function buildUrl(b: Building): string {
  const { id, slug, address } = b
  const { city, neighborhood, streetNumber, streetName } = address || {}
  const buildingName = b.details?.buildingName || b.name || b.buildingName

  const addressSlug = slug || sanitizeAddressSlug(streetNumber, streetName)
  const displaySlug = id ? `${addressSlug}-${id}` : addressSlug

  const parts: string[] = []
  if (city) parts.push(sanitizeUrl(city))
  if (neighborhood) parts.push(sanitizeUrl(neighborhood))
  parts.push(displaySlug)
  if (buildingName) parts.push(sanitizeUrl(buildingName))

  return `/condo/${parts.join('/')}`
}

const all: Building[] = []
let pageNum = 1
const resultsPerPage = 100

process.stderr.write(
  `Fetching condo buildings from ${apiBase} (instance: ${instanceName})...\n`
)

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
    console.error(`API error ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  const data: {
    buildings: Building[]
    numPages: number
    count?: number
    pageSize?: number
  } = await response.json()

  all.push(...data.buildings)
  process.stderr.write(
    `  page ${pageNum}/${data.numPages} — array.length=${data.buildings.length} count=${data.count ?? 'n/a'} pageSize=${data.pageSize ?? 'n/a'}\n`
  )

  if (pageNum >= data.numPages) break
  pageNum++
}

const result: [string, string][] = all
  .map((b): [string, string] => [
    b.details?.buildingName || b.name || b.buildingName || '',
    buildUrl(b)
  ])
  .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))

process.stderr.write(`\nTotal: ${result.length} buildings\n`)

console.log(JSON.stringify(result, null, 2))
