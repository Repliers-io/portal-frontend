/**
 * LocationsTree Pipeline: Sort
 *
 * Sorts areas by total listings count
 */

import { type Tree } from '../types'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total listings count for an area
 * (sum of all cities and neighborhoods)
 */
function calculateAreaListingsCount(
  area: Tree['areas'][0],
  countsMap: Map<string, number>
): number {
  let total = 0

  area.cities.forEach((city) => {
    const cityCount = countsMap.get(city.locationId)
    if (cityCount !== undefined && cityCount >= 0) {
      total += cityCount
    }

    city.neighborhoods.forEach((hood) => {
      const hoodCount = countsMap.get(hood.locationId)
      if (hoodCount !== undefined && hoodCount >= 0) {
        total += hoodCount
      }
    })
  })

  return total
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Sort areas, cities, and neighborhoods by listings count (descending)
 * Modifies tree in place at all levels
 */
export function sortByListingsCount(
  tree: Tree,
  countsMap: Map<string, number>
): void {
  // Sort areas by total listings count
  tree.areas.sort((areaA, areaB) => {
    const countA = calculateAreaListingsCount(areaA, countsMap)
    const countB = calculateAreaListingsCount(areaB, countsMap)
    return countB - countA // Descending order
  })

  // Sort cities within each area
  tree.areas.forEach((area) => {
    area.cities.sort((cityA, cityB) => {
      const countA = countsMap.get(cityA.locationId) ?? 0
      const countB = countsMap.get(cityB.locationId) ?? 0
      return countB - countA // Descending order
    })

    // Sort neighborhoods within each city
    area.cities.forEach((city) => {
      city.neighborhoods.sort((hoodA, hoodB) => {
        const countA = countsMap.get(hoodA.locationId) ?? 0
        const countB = countsMap.get(hoodB.locationId) ?? 0
        return countB - countA // Descending order
      })
    })
  })
}
