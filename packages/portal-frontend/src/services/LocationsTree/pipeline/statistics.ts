/**
 * LocationsTree Pipeline: Statistics
 *
 * Generates statistics about the tree
 */

import { type NodeCounts, type Tree, type TreeStats } from '../types'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count total nodes in tree
 */
function countTotalNodes(tree: Tree): NodeCounts {
  const areas = tree.areas.length

  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    cities += area.cities.length
    area.cities.forEach((city) => {
      neighborhoods += city.neighborhoods.length
    })
  })

  // Add orphaned locations
  cities += tree.orphanedCities?.length || 0
  tree.orphanedCities?.forEach((city) => {
    neighborhoods += city.neighborhoods.length
  })
  neighborhoods += tree.orphanedNeighborhoods?.length || 0

  const total = areas + cities + neighborhoods
  return { total, areas, cities, neighborhoods }
}

/**
 * Count trash nodes in tree
 */
function countTrashNodes(
  tree: Tree,
  statusMap: Map<string, string>
): NodeCounts {
  let areas = 0
  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    const areaStatus = statusMap.get(area.locationId)
    if (areaStatus === 'GARBAGE') areas++

    area.cities.forEach((city) => {
      const cityStatus = statusMap.get(city.locationId)
      if (cityStatus === 'GARBAGE') cities++

      city.neighborhoods.forEach((hood) => {
        const hoodStatus = statusMap.get(hood.locationId)
        if (hoodStatus === 'GARBAGE') neighborhoods++
      })
    })
  })

  // Count orphaned cities
  tree.orphanedCities?.forEach((city) => {
    const cityStatus = statusMap.get(city.locationId)
    if (cityStatus === 'GARBAGE') cities++

    city.neighborhoods.forEach((hood) => {
      const hoodStatus = statusMap.get(hood.locationId)
      if (hoodStatus === 'GARBAGE') neighborhoods++
    })
  })

  // Count orphaned neighborhoods
  tree.orphanedNeighborhoods?.forEach((hood) => {
    const hoodStatus = statusMap.get(hood.locationId)
    if (hoodStatus === 'GARBAGE') neighborhoods++
  })

  const total = areas + cities + neighborhoods
  return { total, areas, cities, neighborhoods }
}

/**
 * Count non-trash nodes in tree
 */
function countNonTrashNodes(
  tree: Tree,
  statusMap: Map<string, string>
): NodeCounts {
  let areas = 0
  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    let hasNonTrashContent = false

    area.cities.forEach((city) => {
      const cityStatus = statusMap.get(city.locationId)
      const cityTrash = cityStatus === 'GARBAGE'

      if (!cityTrash) {
        cities++
        hasNonTrashContent = true
      }

      city.neighborhoods.forEach((hood) => {
        const hoodStatus = statusMap.get(hood.locationId)
        const hoodTrash = hoodStatus === 'GARBAGE'

        if (!hoodTrash) {
          neighborhoods++
          hasNonTrashContent = true
        }
      })
    })

    // Count area as non-trash if it has any non-trash content
    const areaStatus = statusMap.get(area.locationId)
    const areaTrash = areaStatus === 'GARBAGE'
    if (!areaTrash && hasNonTrashContent) {
      areas++
    }
  })

  const total = areas + cities + neighborhoods
  return { total, areas, cities, neighborhoods }
}

/**
 * Count duplicate nodes (unique names that appear multiple times)
 */
function countDuplicateNodes(tree: Tree): NodeCounts {
  // Count unique city names that have duplicates
  const cityNameCounts = new Map<string, number>()
  tree.areas.forEach((area) => {
    area.cities.forEach((city) => {
      cityNameCounts.set(city.name, (cityNameCounts.get(city.name) || 0) + 1)
    })
  })
  tree.orphanedCities?.forEach((city) => {
    cityNameCounts.set(city.name, (cityNameCounts.get(city.name) || 0) + 1)
  })

  let cities = 0
  cityNameCounts.forEach((count) => {
    if (count > 1) cities += 1
  })

  // Count unique neighborhood names that have duplicates
  const hoodNameCounts = new Map<string, number>()
  tree.areas.forEach((area) => {
    area.cities.forEach((city) => {
      city.neighborhoods.forEach((hood) => {
        hoodNameCounts.set(hood.name, (hoodNameCounts.get(hood.name) || 0) + 1)
      })
    })
  })
  tree.orphanedCities?.forEach((city) => {
    city.neighborhoods.forEach((hood) => {
      hoodNameCounts.set(hood.name, (hoodNameCounts.get(hood.name) || 0) + 1)
    })
  })
  tree.orphanedNeighborhoods?.forEach((hood) => {
    hoodNameCounts.set(hood.name, (hoodNameCounts.get(hood.name) || 0) + 1)
  })

  let neighborhoods = 0
  hoodNameCounts.forEach((count) => {
    if (count > 1) neighborhoods += 1
  })

  const total = cities + neighborhoods
  return { total, areas: 0, cities, neighborhoods }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate complete statistics for the tree
 */
export function generateStats(
  tree: Tree,
  statusMap: Map<string, string>,
  countsMap: Map<string, number>,
  apiLocationsCount: number
): TreeStats {
  const totalNodes = countTotalNodes(tree)
  const trashNodes = countTrashNodes(tree, statusMap)
  const nonTrashNodes = countNonTrashNodes(tree, statusMap)
  const duplicateNodes = countDuplicateNodes(tree)

  // Calculate tree size
  const fullTreeData = {
    tree,
    statusMap: Array.from(statusMap.entries()),
    countsMap: Array.from(countsMap.entries())
  }
  const treeJSON = JSON.stringify(fullTreeData)
  const treeSizeBytes = new TextEncoder().encode(treeJSON).length

  return {
    apiLocationsCount,
    totalNodes,
    duplicateNodes,
    trashNodes,
    nonTrashNodes,
    treeSizeBytes
  }
}
