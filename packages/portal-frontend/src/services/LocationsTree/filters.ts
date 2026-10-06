/**
 * Location Tree Filters
 *
 * Provides filtering and extraction logic for location trees
 */

import { getLocationUrl } from 'utils/urls'

import {
  type CityWithNeighborhoods,
  type NearbyCandidate,
  type Tree,
  type TreeNode
} from './types'

/**
 * Location MATCH KEY: collapses case, whitespace and the `-area` suffix so two
 * spellings of the same place compare equal. For comparison / keying ONLY
 * (slug ↔ tree node, API ↔ tree reconciliation) — NEVER for building URLs: it
 * destroys word boundaries (`Gig Harbor` → `gigharbor`). Use `sanitizeUrl` for URLs.
 */
export function locationMatchKey(name: string): string {
  return name.toLowerCase().replace('-area', '').replace(/\s+/g, '').trim()
}

/**
 * Find a specific area by name in the tree
 */
export function findAreaByName(tree: Tree, areaName: string) {
  const normalized = locationMatchKey(areaName)
  return tree.areas.find((area) => locationMatchKey(area.name) === normalized)
}

/**
 * Find a specific city by name in a list of cities
 */
export function findCityByName(
  cities: TreeNode[],
  cityName: string
): CityWithNeighborhoods | undefined {
  const normalized = locationMatchKey(cityName)
  const matches = cities.filter(
    (city) => locationMatchKey(city.name) === normalized
  )
  if (!matches.length) return undefined

  // A name can resolve to several nodes: duplicate branches (same locationId) or
  // genuine collisions across areas (e.g. TRREB "Ashton" in Ottawa vs Lanark, URBN
  // "Ashford" in Pierce vs Lewis). Pick the most prominent by active listing count
  // so resolution is deterministic — not tree order — and points at one place.
  const best = matches.reduce((top, city) =>
    (city.activeCount ?? 0) > (top.activeCount ?? 0) ? city : top
  )
  return best as CityWithNeighborhoods
}

/**
 * Extract all cities from the tree or from a specific area
 */
export function extractCities(tree: Tree, areaName?: string): TreeNode[] {
  if (areaName) {
    const area = findAreaByName(tree, areaName)
    return area?.cities || []
  }

  return tree.areas.flatMap((area) => area.cities)
}

/**
 * Extract neighborhoods for a specific city
 */
export function extractNeighborhoods(
  tree: Tree,
  cityName: string,
  areaName?: string
): TreeNode[] {
  const cities = extractCities(tree, areaName)
  const city = findCityByName(cities, cityName)
  return city?.neighborhoods || []
}

/**
 * Map the city/neighbourhood names parsed out of a URL onto the tree's own spelling.
 * The URL parser can only echo the slug back — `arborheights` becomes `Arborheights` —
 * while the listings and buildings APIs match on the exact name, so an unresolved
 * spelling variant queries a name that does not exist and renders an empty page.
 * Matching through locationMatchKey collapses the spacing variants onto the real node;
 * callers use its name for the API query and the canonical URL alike, and treat a
 * missing node as a 404.
 */
export function resolveLocation(
  tree: Tree,
  { area, city, hood }: { area?: string; city?: string; hood?: string }
) {
  const cityNode = city
    ? findCityByName(extractCities(tree, area), city)
    : undefined

  // A tenant can record a place as an area whose children are cities — TRREB has
  // Toronto that way, with North York and Scarborough beneath it — so its short
  // URL carries the name in the city position, where no city answers to it. An
  // area of that name then takes the request. A real city always wins: one tenant
  // records both an area and a city called Toronto. A URL that also names a
  // neighbourhood is asking for something an area page cannot answer, so it is
  // left unresolved rather than silently answered by the area.
  const areaNode =
    !cityNode && city && !hood ? findAreaByName(tree, city) : undefined

  const hoodMatches =
    cityNode && hood
      ? extractNeighborhoods(tree, cityNode.name, area).filter(
          (node) => locationMatchKey(node.name) === locationMatchKey(hood)
        )
      : []

  // Same tie-break as findCityByName: a name can hit several nodes, so pick the most
  // prominent one rather than depending on tree order.
  const hoodNode = hoodMatches.length
    ? hoodMatches.reduce((top, node) =>
        (node.activeCount ?? 0) > (top.activeCount ?? 0) ? node : top
      )
    : undefined

  return { areaNode, cityNode, hoodNode }
}

/**
 * Whether the short, city-position URL (`/on/toronto`) belongs to this area. It
 * does unless a city shares the name — then the city owns that URL and the area
 * keeps its `-area` marker. A name the tree carries as no area at all never
 * qualifies: `/on/central-area` parses to "Central" on the strength of the
 * suffix alone, and rewriting that to `/on/central` would point the canonical at
 * a different page than the one asked for.
 */
export const areaOwnsShortUrl = (tree: Tree, area: string) =>
  Boolean(findAreaByName(tree, area)) &&
  !findCityByName(extractCities(tree), area)

/**
 * Public URL of an area, short where the area owns it — resolveLocation maps
 * that position back to the area. Emitted for canonicals and the sitemap; in-app
 * links stay on the marker form, which the `-area` parsers outside /locations
 * still require.
 */
export const getAreaUrl = (tree: Tree, area: string, filters: string[] = []) =>
  areaOwnsShortUrl(tree, area)
    ? getLocationUrl({ city: area, filters })
    : getLocationUrl({ area, filters })

/**
 * Every neighbourhood in the tree, each tagged with the city that owns it.
 * Nearby lookups are not scoped to one city, so the parent name has to travel
 * with the node — it is the only way back to a correct link.
 */
export function extractAllNeighborhoods(tree: Tree): NearbyCandidate[] {
  return tree.areas.flatMap((area) =>
    (area.cities ?? []).flatMap((city) =>
      (city.neighborhoods ?? []).map((hood) => ({ ...hood, city: city.name }))
    )
  )
}

/**
 * Filter out duplicate locations based on statusMap
 * Returns only unique locations (not marked as duplicates)
 */
export function filterDuplicates<T extends TreeNode>(
  locations: T[],
  statusMap: Map<string, string>
): T[] {
  return locations.filter((loc) => {
    const status = statusMap.get(loc.locationId)
    return !status || !status.includes('duplicate')
  })
}

/**
 * Filter out trash locations
 */
export function filterTrashLocations<T extends TreeNode>(
  locations: T[],
  statusMap: Map<string, string>
): T[] {
  return locations.filter((loc) => {
    const status = statusMap.get(loc.locationId)
    return status !== 'trash'
  })
}
