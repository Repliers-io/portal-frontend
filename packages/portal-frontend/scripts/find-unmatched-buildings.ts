/**
 * Finds WP building sources not yet matched (empty destination, not in manual redirects).
 * Performs fuzzy name matching against Repliers buildings and prints candidates.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const repliersBuildings: { name: string; address: string; url: string }[] =
  JSON.parse(
    fs.readFileSync(path.join(rootDir, 'repliers-buildings.json'), 'utf8')
  )

const redirectsRaw = fs.readFileSync(
  path.join(rootDir, 'src/configs/urbn/redirects-buildings.ts'),
  'utf8'
)
const manualRaw = fs.readFileSync(
  path.join(rootDir, 'src/configs/urbn/redirects-buildings-manual.ts'),
  'utf8'
)

// Sources already covered in manual redirects
const manualSources = new Set(
  [...manualRaw.matchAll(/source:\s*'([^']+)'/g)].map((m) => m[1])
)

// Sources with empty destination in auto file
const unmatchedSources = [
  ...redirectsRaw.matchAll(/source:\s*'([^']+)',\s*\n\s*destination:\s*'',/g)
].map((m) => m[1])

const remaining = unmatchedSources.filter((s) => !manualSources.has(s))

// Extract last segment of WP URL as the building identifier slug
// e.g. /seattle-condos/ballard/canal-station → "canal-station"
function wpSlug(source: string): string {
  return source.split('/').pop() ?? ''
}

// Normalize string for comparison: lowercase, remove non-alphanumeric
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Simple token overlap score (0-1)
function tokenOverlap(a: string, b: string): number {
  const tokA = new Set(
    a
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  )
  const tokB = new Set(
    b
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  )
  if (tokA.size === 0 || tokB.size === 0) return 0
  let shared = 0
  tokA.forEach((t) => {
    if (tokB.has(t)) shared++
  })
  return shared / Math.max(tokA.size, tokB.size)
}

// Check if WP slug tokens are contained in building name
function slugMatchesName(slug: string, name: string): number {
  const slugWords = slug.split('-').filter((w) => w.length > 2)
  const normName = normalize(name)
  const normSlug = normalize(slug.replace(/-/g, ''))

  // Direct substring match
  if (normName.includes(normSlug)) return 0.9
  if (normSlug.includes(normalize(name.replace(/\s/g, '')))) return 0.85

  // Token overlap
  return tokenOverlap(slug.replace(/-/g, ' '), name)
}

interface Match {
  source: string
  slug: string
  building: { name: string; address: string; url: string }
  score: number
  reason: string
}

const highConfidence: Match[] = []
const mediumConfidence: Match[] = []

for (const source of remaining) {
  const slug = wpSlug(source)

  let best: {
    building: { name: string; address: string; url: string }
    score: number
    reason: string
  } | null = null

  for (const b of repliersBuildings) {
    const nameScore = slugMatchesName(slug, b.name)
    if (nameScore > (best?.score ?? 0)) {
      best = {
        building: b,
        score: nameScore,
        reason: `name match (${Math.round(nameScore * 100)}%)`
      }
    }
  }

  if (!best || best.score < 0.4) continue

  const match: Match = {
    source,
    slug,
    building: best.building,
    score: best.score,
    reason: best.reason
  }
  if (best.score >= 0.75) {
    highConfidence.push(match)
  } else if (best.score >= 0.4) {
    mediumConfidence.push(match)
  }
}

console.log(`\nUnmatched remaining: ${remaining.length}`)
console.log(`High confidence (≥75%): ${highConfidence.length}`)
console.log(`Medium confidence (40-74%): ${mediumConfidence.length}\n`)

console.log('=== HIGH CONFIDENCE ===')
for (const m of highConfidence) {
  console.log(`  ${m.source}`)
  console.log(`    → ${m.building.name}  |  ${m.building.address}`)
  console.log(`    → ${m.building.url}  [${m.reason}]`)
}

console.log('\n=== MEDIUM CONFIDENCE ===')
for (const m of mediumConfidence) {
  console.log(`  ${m.source}`)
  console.log(`    → ${m.building.name}  |  ${m.building.address}`)
  console.log(`    → ${m.building.url}  [${m.reason}]`)
}
