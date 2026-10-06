/**
 * Locations tree generator entry point.
 * Bundled by generate-locations-tree.mjs via esbuild, then run with Node.js.
 */

import fs from 'fs'
import path from 'path'

import { booleanPointInPolygon, point } from '@turf/turf'
import type { Position } from 'geojson'

import locationConfig from '@configs/location'
import mapConfig from '@configs/map'

import { buildProductionTree, toCacheFile } from 'services/LocationsTree'

// -------------------------------------------------------------------
// Boundary clip
// -------------------------------------------------------------------

type GeoNode = {
  name?: string
  map?: {
    latitude?: number | string
    longitude?: number | string
    boundary?: unknown
  }
  cities?: GeoNode[]
  neighborhoods?: GeoNode[]
}

/**
 * Every [lng, lat] pair in a boundary, whatever nesting it arrived in — the API
 * sends a single polygon or a multi-polygon, and only some paths normalize it.
 */
const vertices = (boundary: unknown): Position[] =>
  Array.isArray(boundary)
    ? typeof boundary[0] === 'number'
      ? [boundary as Position]
      : boundary.flatMap(vertices)
    : []

/**
 * The tree itself is fetched by a 4000km radius around the tenant centre, so the
 * only thing that can bound it geographically is the tenant's own search polygon
 * (`mapConfig.searchArea.boundary` — the same shape listing search is clipped to
 * when `constrainToSearchBoundary` is on). Tenants without a polygon keep every
 * location the board returns, as before.
 */
function clipToBoundary(areas: GeoNode[]) {
  const { boundary } = mapConfig.searchArea
  if (!boundary?.length) return { areas, dropped: 0, unlocated: 0 }

  const shape = { type: 'MultiPolygon' as const, coordinates: boundary }
  let dropped = 0
  let unlocated = 0

  const at = (position: Position) =>
    booleanPointInPolygon(point(position), shape)

  // A node without coordinates cannot be proven outside, so it stays.
  const inside = ({ map }: GeoNode) => {
    const lat = Number(map?.latitude)
    const lng = Number(map?.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      unlocated++
      return true
    }
    return at([lng, lat])
  }

  /**
   * The boundary is a union of whole areas, so an area lying mostly inside it IS
   * one of them and every place under it is covered — pass those through
   * untested, because the centre test cannot be trusted on them: the API puts
   * Central Toronto's centre in the Ship Channel, 110m outside a boundary that
   * traces the shoreline, and dropping that one city took its 80 neighbourhoods
   * with it. Waterfront neighbourhoods (Harbourfront, Mimico, Port Credit, The
   * Beach) fail it the same way. An area only partly reached — movesmartly covers
   * three Simcoe cities of fourteen — keeps testing each child, which is what
   * keeps the rest of Simcoe out.
   */
  const covered = (area: GeoNode) => {
    const outline = vertices(area.map?.boundary)
    return outline.length > 0 && outline.filter(at).length * 2 > outline.length
  }

  const keep = (nodes: GeoNode[] = []) => {
    const kept = nodes.filter(inside)
    dropped += nodes.length - kept.length
    return kept
  }

  const clipped = areas
    .map((area) => {
      if (covered(area)) return area

      const cities = keep(area.cities).map((city) => ({
        ...city,
        ...(city.neighborhoods
          ? { neighborhoods: keep(city.neighborhoods) }
          : {})
      }))
      return { ...area, ...(area.cities ? { cities } : {}) }
    })
    // An area is a container: it survives on its cities, not on its own centre,
    // which for a large region can sit outside the polygon.
    .filter((area) => (area.cities ? area.cities.length > 0 : inside(area)))

  dropped += areas.length - clipped.length
  return { areas: clipped, dropped, unlocated }
}

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------

async function main() {
  const instance = process.env.NEXT_PUBLIC_APP_CONFIGURATION || 'defaults'

  const { areaThreshold } = locationConfig

  console.log(
    `[generate-locations] instance=${instance} areaThreshold=${areaThreshold}`
  )
  console.log(
    `[generate-locations] ${process.env.LOCATIONS_GEN_RPS || 6} req/s, ` +
      `${process.env.LOCATIONS_GEN_CONCURRENCY || 8} in flight ` +
      `(LOCATIONS_GEN_RPS / LOCATIONS_GEN_CONCURRENCY)`
  )
  console.log('[generate-locations] building tree...')

  const startTime = Date.now()

  const result = await buildProductionTree({
    debug: false,
    hideTrash: true,
    sortByCount: true,
    fetchAllCounts: true,
    skipNeighborhoods: false,
    areaThreshold
  })

  const { tree, metadata, stats } = result

  const {
    areas: boundedAreas,
    dropped,
    unlocated
  } = clipToBoundary(tree.areas as GeoNode[])

  if (mapConfig.searchArea.boundary?.length) {
    console.log(
      `[generate-locations] boundary clip: dropped ${dropped} locations outside searchArea.boundary`
    )
    if (unlocated) {
      console.log(
        `[generate-locations] boundary clip: kept ${unlocated} locations without coordinates`
      )
    }
  }

  const output = toCacheFile(boundedAreas, { metadata, stats })

  const outputDir = path.resolve(process.cwd(), 'public', instance)
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'locations.json')
  fs.writeFileSync(outputPath, JSON.stringify(output))

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const sizeKb = Math.round(fs.statSync(outputPath).size / 1024)

  console.log(`[generate-locations] done in ${elapsed}s`)
  console.log(`[generate-locations] written ${sizeKb} KB → ${outputPath}`)
  console.log(`[generate-locations] areas: ${boundedAreas.length}`)
  console.log(
    `[generate-locations] retried (429 recovered): ${metadata.retriedCount}`
  )
  console.log(
    `[generate-locations] failed (all retries exhausted): ${metadata.failedCount}`
  )
}

main().catch((err) => {
  console.error('[generate-locations] ERROR:', err)
  process.exit(1)
})
