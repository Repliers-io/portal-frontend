/**
 * Merges all area polygons from gta-areas.json into a single unified polygon.
 * Usage: npx tsx scripts/merge-gta-areas.ts [path/to/gta-areas.json]
 * Output: GeoJSON geometry printed to stdout.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import {
  area,
  bbox,
  buffer,
  featureCollection,
  simplify,
  union
} from '@turf/turf'
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'

const inputPath = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, '../../../../gta-areas.json')

const outputPath = process.argv[3]
  ? resolve(process.argv[3])
  : inputPath.replace(/\.json$/, '-merged.json')

const raw = JSON.parse(readFileSync(inputPath, 'utf-8')) as {
  locations: Array<{
    name: string
    map: { boundary: number[][][]; geometryType: string }
  }>
}

const features: Feature<Polygon>[] = raw.locations.map((loc) => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: loc.map.boundary
  },
  properties: { name: loc.name }
}))

if (features.length === 0) {
  console.error('No locations found.')
  process.exit(1)
}

const merged = union(featureCollection(features))
if (!merged) {
  console.error('union() returned null — check that polygons are valid.')
  process.exit(1)
}

// Neighbouring municipalities come from different digitizations, so their shared
// edges never match to the last decimal and the union leaves zero-width seam spikes
// behind as interior rings. `simplify` throws on them, because `cleanCoords` drops
// their collinear points and the ring collapses below the 4 a ring needs. Any real
// enclave would span hectares, so a ring under 1 ha is a seam, not geography.
const seam = (ring: Position[]) =>
  area({ type: 'Polygon', coordinates: [ring] }) < 10_000

const mergedGeom = merged.geometry as Polygon | MultiPolygon
const mergedPolygons =
  mergedGeom.type === 'MultiPolygon'
    ? mergedGeom.coordinates
    : [mergedGeom.coordinates]
const cleaned = mergedPolygons.map(([outer, ...holes]) => [
  outer,
  ...holes.filter((ring) => !seam(ring))
])
merged.geometry =
  cleaned.length === 1
    ? { type: 'Polygon', coordinates: cleaned[0] }
    : { type: 'MultiPolygon', coordinates: cleaned }

const [minLng, minLat, maxLng, maxLat] = bbox(merged)

const boundsRing = [
  [minLng, minLat],
  [minLng, maxLat],
  [maxLng, maxLat],
  [maxLng, minLat],
  [minLng, minLat]
]

// Simplified + buffered polygon for API search boundary.
// 1. Simplify the merged polygon (~500m tolerance) to reduce coordinate count.
// 2. Buffer by 100m so simplification never clips real listings near the edge.
// 3. Simplify the buffer result lightly to remove buffer artefacts.
const simplified = simplify(merged, { tolerance: 0.005, highQuality: true })
const buffered = buffer(simplified, 0.1, { units: 'kilometers' })
if (!buffered) {
  console.error('buffer() returned null.')
  process.exit(1)
}
const searchFeature = simplify(buffered, {
  tolerance: 0.001,
  highQuality: true
})
const searchGeom = searchFeature.geometry as Polygon | MultiPolygon
const searchPolygon: Position[][][] =
  searchGeom.type === 'MultiPolygon'
    ? searchGeom.coordinates
    : [searchGeom.coordinates]

const output = {
  names: [...new Set(raw.locations.map((l) => l.name))],
  bounds: boundsRing,
  searchPolygon,
  geometry: merged.geometry
}

console.log(JSON.stringify(output, null, 2))
writeFileSync(outputPath, JSON.stringify(output, null, 2))
console.error(`Written to ${outputPath}`)
