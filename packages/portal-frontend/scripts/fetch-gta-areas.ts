/**
 * Fetches the location polygons the movesmartly search boundary is built from and
 * writes them in the shape `merge-gta-areas.ts` reads.
 *
 * The polygons come from the tenant's own `UserDefined` location tree (see
 * `configs/movesmartly-com/location.ts`) — on this board the MLS `area` records
 * carry no boundary at all.
 *
 * Output:
 *   <monorepo root>/gta-areas.json
 *
 * Usage:
 *   tsx scripts/fetch-gta-areas.ts                      # NEXT_PUBLIC_API_URL from .env.movesmartly-com
 *   tsx scripts/fetch-gta-areas.ts http://localhost:8080 # explicit API host
 *
 * Then, to regenerate `configs/movesmartly-com/searchBoundary.ts`:
 *   tsx scripts/merge-gta-areas.ts ../../gta-areas.json ../../gta-areas-merged.json
 *   node scripts/gen-search-boundary.js
 */
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import type { Position } from 'geojson'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })
dotenv.config({
  path: path.join(rootDir, '.env.movesmartly-com'),
  override: true,
  quiet: true
})

const apiUrl = `${process.argv[2]?.trim() || process.env.NEXT_PUBLIC_API_URL}/api`

const areas = [
  'Halton Region',
  'Toronto',
  'Peel Region',
  'York Region',
  'Durham Region',
  'Hamilton'
]

// Barrie plus the two municipalities that bridge it to York Region — without them
// the union falls apart into a detached island with a gap along Hwy 400.
const simcoeCities = ['Barrie', 'Innisfil', 'Bradford West Gwillimbury']

type ApiLocation = {
  name: string
  map?: { boundary?: Position[][] | Position[][][] }
}

const fetchLocations = async (params: Record<string, string>) => {
  const query = new URLSearchParams({
    source: 'UserDefined',
    fields: 'name,type,map',
    resultsPerPage: '300',
    ...params
  })
  const response = await fetch(`${apiUrl}/locations?${query}`)
  if (!response.ok) {
    throw new Error(`/locations ${query} failed: ${response.status}`)
  }
  const { locations } = (await response.json()) as { locations: ApiLocation[] }
  return locations ?? []
}

// A boundary arrives as a single polygon (`Position[][]`) or a multi-polygon
// (`Position[][][]`); the merge step reads one polygon per entry, so split it.
const polygons = (boundary: Position[][] | Position[][][]): Position[][][] =>
  Array.isArray(boundary[0]?.[0]?.[0])
    ? (boundary as Position[][][])
    : [boundary as Position[][]]

const collect = (names: string[], locations: ApiLocation[]) =>
  names.flatMap((name) => {
    const boundary = locations.find((l) => l.name === name)?.map?.boundary
    if (!boundary?.length) {
      throw new Error(`No boundary for "${name}" — search area would shrink`)
    }
    return polygons(boundary).map((polygon) => ({
      name,
      map: { boundary: polygon }
    }))
  })

const [apiAreas, apiCities] = await Promise.all([
  fetchLocations({ type: 'area' }),
  fetchLocations({ type: 'city', area: 'Simcoe Region' })
])

const locations = [
  ...collect(areas, apiAreas),
  ...collect(simcoeCities, apiCities)
]

const outputPath = path.resolve(rootDir, '../../gta-areas.json')
fs.writeFileSync(outputPath, JSON.stringify({ locations }, null, 2))
console.log(`Written ${locations.length} polygons to ${outputPath}`)
