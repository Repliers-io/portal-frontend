/**
 * Static locations tree loader.
 *
 * Reads the pre-generated `public/{instance}/locations.json` file
 * produced by `npm run generate:locations` instead of hitting the API
 * at runtime. This is the primary path for all location pages.
 *
 * The JSON is generated with full counts and deduplication applied,
 * so `activeCount` is already present on every tree node.
 */

import { cache } from 'react'
import path from 'path'

import { readFile } from 'fs/promises'

import { logError } from 'utils/log'

import { type CompactNode, expandTree } from './cache'
import {
  type AreaWithCities,
  type TreeMetadata,
  type TreeResult,
  type TreeStats
} from './types'

function buildCountsMap(areas: AreaWithCities[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const area of areas) {
    if (area.locationId != null && area.activeCount != null)
      map.set(area.locationId, area.activeCount)
    for (const city of area.cities ?? []) {
      if (city.locationId != null && city.activeCount != null)
        map.set(city.locationId, city.activeCount)
      for (const hood of city.neighborhoods ?? []) {
        if (hood.locationId != null && hood.activeCount != null)
          map.set(hood.locationId, hood.activeCount)
      }
    }
  }
  return map
}

/**
 * Read + expand `locations.json`. Wrapped in React's `cache` so the several callers
 * inside one request — generateMetadata and the page body both resolve location names
 * against the tree — share a single read and parse of a file measured in hundreds of KB.
 */
export const loadStaticTree = cache(async (): Promise<TreeResult> => {
  const instance = process.env.NEXT_PUBLIC_APP_CONFIGURATION || 'defaults'
  const filePath = path.join(
    process.cwd(),
    'public',
    instance,
    'locations.json'
  )

  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch {
    logError(
      `[loadStaticTree] locations.json not found at ${filePath}. ` +
        'Run "npm run generate:locations" to generate it. Returning empty tree.'
    )
    return {
      tree: { areas: [] },
      metadata: {
        requestCount: 0,
        processingTime: 0,
        totalListings: 0,
        retriedCount: 0,
        failedCount: 0
      },
      stats: undefined,
      countsMap: new Map(),
      statusMap: new Map()
    }
  }

  const raw = JSON.parse(content) as {
    tree: { areas: CompactNode[] }
    metadata: TreeMetadata
    stats: TreeStats
    createdAt: string
    /** The locations source every node was fetched with — informational. */
    source?: string
  }

  const tree = expandTree(raw.tree.areas)

  return {
    tree,
    metadata: raw.metadata,
    stats: raw.stats,
    countsMap: buildCountsMap(tree.areas),
    statusMap: new Map()
  }
})

let countsMapPromise: Promise<Map<string, number>> | null = null

/**
 * Memoized `locationId -> activeCount` map for server-side count gating (e.g. the
 * overlay dedupe route). Reads + parses `locations.json` ONCE per process and
 * retains only the counts Map — the parsed tree is GC'd. The cache is regenerated
 * offline (nightly), so no in-process invalidation is needed; a redeploy/restart
 * picks up a newer file. Falls back to an empty map when the file is missing (via
 * `loadStaticTree`), which disables gating rather than throwing.
 */
export function loadCountsMap(): Promise<Map<string, number>> {
  if (!countsMapPromise) {
    countsMapPromise = loadStaticTree().then((result) => result.countsMap)
  }
  return countsMapPromise
}
