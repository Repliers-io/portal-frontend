/**
 * Location Tree Builder
 *
 * Provides production-ready tree building with proper filtering,
 * deduplication, and count fetching
 */

import { LocationsTree } from './LocationsTree'

export interface ProductionTreeOptions {
  /**
   * Fetch counts for all locations (not just duplicates)
   * This is expensive but provides accurate counts
   */
  fetchAllCounts?: boolean

  /**
   * Skip fetching neighborhood counts (saves requests when neighborhoods not needed)
   */
  skipNeighborhoods?: boolean

  /**
   * Hide trash locations (duplicates with 0 counts, orphans, etc.)
   */
  hideTrash?: boolean

  /**
   * Sort locations by listing count (descending)
   */
  sortByCount?: boolean

  /**
   * Minimum listings threshold for areas to not be marked as trash
   */
  areaThreshold?: number

  /**
   * Include debug information (orphans, stats)
   */
  debug?: boolean
}

/**
 * Build location tree with production settings
 * Uses the same logic as debug mode but with sensible defaults
 */
export async function buildProductionTree(options: ProductionTreeOptions = {}) {
  const {
    fetchAllCounts = true,
    skipNeighborhoods = true,
    hideTrash = true,
    sortByCount = true,
    areaThreshold = 200,
    debug = false
  } = options

  const tree = new LocationsTree()

  const result = await tree.buildTree({
    checkAll: fetchAllCounts,
    skipNeighborhoods,
    checkOrphans: true,
    hideTrash,
    sortByCount,
    areaThreshold,
    debug
  })

  const { tree: treeData, countsMap } = result

  for (const area of treeData.areas) {
    area.activeCount = countsMap.get(area.locationId)

    for (const city of area.cities || []) {
      city.activeCount = countsMap.get(city.locationId)

      for (const hood of city.neighborhoods || []) {
        hood.activeCount = countsMap.get(hood.locationId)
      }
    }
  }

  if (treeData.orphanedCities) {
    for (const city of treeData.orphanedCities) {
      city.activeCount = countsMap.get(city.locationId)

      for (const hood of city.neighborhoods || []) {
        hood.activeCount = countsMap.get(hood.locationId)
      }
    }
  }

  if (treeData.orphanedNeighborhoods) {
    for (const hood of treeData.orphanedNeighborhoods) {
      hood.activeCount = countsMap.get(hood.locationId)
    }
  }

  return result
}
