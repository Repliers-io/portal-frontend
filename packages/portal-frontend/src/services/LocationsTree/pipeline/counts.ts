/**
 * LocationsTree Pipeline: Counts All
 *
 * Fetches listings counts for ALL locations in the tree (concurrently)
 */

import { type ApiGeoFilters } from 'services/API/types'

import { type Tree } from '../types'

import { runThrottled } from './concurrency'

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch listings counts for ALL locations in tree.
 * Runs requests concurrently (default: 50 in-flight at a time).
 * Merges with existing counts if provided.
 */
export async function addCountsToAll(
  tree: Tree,
  countsMap: Map<string, number>,
  options: {
    fetchListingsCount: (
      params: ApiGeoFilters
    ) => Promise<{ count: number; lastUpdatedOn?: string }>
    skipNeighborhoods?: boolean
    onProgress?: (completed: number, total: number) => void
  }
): Promise<number> {
  const { fetchListingsCount, skipNeighborhoods = false, onProgress } = options

  type Task = { locationId: string; params: ApiGeoFilters }
  const pending: Task[] = []

  // Collect all tasks — areas -> cities -> neighborhoods
  for (const area of tree.areas) {
    for (const city of area.cities) {
      if (!countsMap.has(city.locationId)) {
        pending.push({
          locationId: city.locationId,
          params: { locationId: city.locationId }
        })
      }

      if (!skipNeighborhoods) {
        for (const hood of city.neighborhoods) {
          if (!countsMap.has(hood.locationId)) {
            pending.push({
              locationId: hood.locationId,
              params: { locationId: hood.locationId }
            })
          }
        }
      }
    }
  }

  // Orphaned cities
  if (tree.orphanedCities) {
    for (const city of tree.orphanedCities) {
      if (!countsMap.has(city.locationId)) {
        pending.push({
          locationId: city.locationId,
          params: { locationId: city.locationId }
        })
      }

      if (!skipNeighborhoods) {
        for (const hood of city.neighborhoods) {
          if (!countsMap.has(hood.locationId)) {
            pending.push({
              locationId: hood.locationId,
              params: { locationId: hood.locationId }
            })
          }
        }
      }
    }
  }

  // Orphaned neighborhoods
  if (tree.orphanedNeighborhoods && !skipNeighborhoods) {
    for (const hood of tree.orphanedNeighborhoods) {
      if (!countsMap.has(hood.locationId)) {
        pending.push({
          locationId: hood.locationId,
          params: { locationId: hood.locationId }
        })
      }
    }
  }

  // Rate- and concurrency-limited: see runThrottled
  await runThrottled(
    pending.map(({ locationId, params }) => async () => {
      const result = await fetchListingsCount(params)
      countsMap.set(locationId, result.count)
    }),
    onProgress
  )

  return pending.length
}
