/**
 * Dumps all buildings from the Repliers API to repliers-buildings.json in the project root.
 * Each entry: { name, address, url }
 *
 * Usage:
 *   pnpm tsx scripts/dump-repliers-buildings.ts urbn
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

const instanceName = process.argv[2]?.trim() || 'defaults'
const instanceEnvFile = path.join(rootDir, `.env.${instanceName}`)
if (fs.existsSync(instanceEnvFile)) {
  dotenv.config({ path: instanceEnvFile, override: true, quiet: true })
}

const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
if (!apiBase) {
  console.error(`NEXT_PUBLIC_API_URL not set for instance "${instanceName}"`)
  process.exit(1)
}

function sanitizeUrl(str: string): string {
  return encodeURIComponent(
    str.replaceAll('-', '\u2011').replaceAll(' ', '-').toLowerCase()
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUrl(b: any): string {
  const { city, neighborhood } = b.address || {}
  const name = b.details?.buildingName
  const parts: string[] = ['/condo-building']
  if (city) parts.push(sanitizeUrl(city))
  if (neighborhood) parts.push(sanitizeUrl(neighborhood))
  if (name) parts.push(sanitizeUrl(name))
  return parts.join('/')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw: any[] = []
let pageNum = 1

process.stderr.write(
  `\nFetching from ${apiBase} (instance: ${instanceName})...\n`
)

while (true) {
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    resultsPerPage: '100',
    class: 'condo',
    minStories: '4'
  })

  process.stderr.write(`  page ${pageNum}  fetching... `)

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
    process.stderr.write(`\nHTTP ${response.status} ${response.statusText}\n`)
    process.exit(1)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: { buildings: any[]; numPages: number } = await response.json()
  raw.push(...data.buildings)
  process.stderr.write(`${data.buildings.length} buildings\n`)

  if (pageNum >= data.numPages) break
  pageNum++
}

const result = raw
  .filter((b) => b.details?.buildingName)
  .sort((a, b) =>
    (a.details.buildingName as string).localeCompare(b.details.buildingName)
  )
  .map((b) => {
    const {
      streetNumber,
      streetName,
      streetSuffix,
      streetDirection,
      city,
      state,
      zip
    } = b.address || {}
    const addressParts = [
      streetNumber,
      streetName,
      streetSuffix,
      streetDirection
    ]
      .filter(Boolean)
      .join(' ')
    return {
      name: b.details.buildingName as string,
      address: [addressParts, city, state, zip].filter(Boolean).join(', '),
      url: buildUrl(b)
    }
  })

const outputPath = path.join(rootDir, 'repliers-buildings.json')
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8')

process.stderr.write(
  `\n  wrote ${outputPath}  (${result.length} buildings)\n\n`
)
