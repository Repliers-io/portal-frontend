/**
 * On-disk shape of `public/<tenant>/locations.json`.
 *
 * The file is machine-only: it is written by the generator and read by
 * `loadStaticTree`, never by a human and never by the browser. So it stores short
 * keys, coordinates as a pair, and one child key for every level — the level is
 * implied by depth. Runtime code keeps speaking `ApiLocation`; expansion happens
 * once per read.
 *
 * Both writers — the CLI generator and `/api/generateLocations` — must go through
 * `toCompactTree`, or the two drift apart and the reader breaks on one of them.
 */

import {
  type AreaWithCities,
  type Tree,
  type TreeMetadata,
  type TreeStats
} from './types'

export type CompactNode = {
  /** locationId */
  i: string
  /** name */
  n: string
  /** activeCount */
  c?: number
  /** centre point, [latitude, longitude] */
  p?: [number, number]
  /** children — cities under an area, neighbourhoods under a city */
  s?: CompactNode[]
}

// 5 decimals ≈ 1 m — the centre of a city or a neighbourhood needs no more, and
// two digits per number over thousands of nodes are not free.
const round = (n: number) => parseFloat(n.toFixed(5))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toCompactNode = (node: any): CompactNode => {
  const { locationId, name, activeCount, map, cities, neighborhoods } = node
  const latitude = Number(map?.latitude)
  const longitude = Number(map?.longitude)
  const children = cities ?? neighborhoods

  return {
    i: locationId,
    n: name,
    ...(activeCount != null ? { c: activeCount } : {}),
    // Only the centre survives: a page draws the polygon of one location and
    // fetches it, so boundaries would multiply the file for no request saved.
    ...(Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { p: [round(latitude), round(longitude)] as [number, number] }
      : {}),
    ...(children?.length ? { s: children.map(toCompactNode) } : {})
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toCompactTree = (areas: any[]): CompactNode[] =>
  areas.map(toCompactNode)

/**
 * The whole file, assembled in one place so the CLI generator and
 * `/api/generateLocations` cannot produce different shapes.
 *
 * `source` is a property of the query, not of a node: every location comes from
 * the same `locationConfig.source`, so it is stamped once in the
 * header instead of being repeated on thousands of nodes.
 */
export const toCacheFile = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  areas: any[],
  { metadata, stats }: { metadata: TreeMetadata; stats?: TreeStats }
) => ({
  createdAt: new Date().toISOString(),
  source: areas[0]?.source ?? areas[0]?.cities?.[0]?.source,
  metadata,
  stats,
  tree: { areas: toCompactTree(areas) }
})

type ExpandedNode = {
  locationId: string
  name: string
  activeCount?: number
  map?: { latitude: number; longitude: number }
  cities?: ExpandedNode[]
  neighborhoods?: ExpandedNode[]
}

const expandNode = (
  { i, n, c, p, s }: CompactNode,
  depth: number
): ExpandedNode => ({
  locationId: i,
  name: n,
  ...(c != null ? { activeCount: c } : {}),
  ...(p ? { map: { latitude: p[0], longitude: p[1] } } : {}),
  ...(s?.length
    ? {
        [depth === 0 ? 'cities' : 'neighborhoods']: s.map((child) =>
          expandNode(child, depth + 1)
        )
      }
    : depth === 0
      ? { cities: [] }
      : {})
})

/**
 * Compact areas → the tree every consumer expects. The cast mirrors what the
 * reader already assumed: the file carries no `type` field (nothing reads it off
 * a cached node), so an expanded node is an `ApiLocation` minus that key.
 */
export const expandTree = (areas: CompactNode[]): Tree => ({
  areas: areas.map((area) => expandNode(area, 0)) as unknown as AreaWithCities[]
})
