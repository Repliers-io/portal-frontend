/**
 * LocationsTree Pipeline: Area Threshold
 *
 * Marks areas as trash if total listings count is below threshold
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
 * Mark areas as trash if total listings count is below threshold
 * Modifies statusMap in place
 */
export function markAreasByThreshold(
  tree: Tree,
  statusMap: Map<string, string>,
  countsMap: Map<string, number>,
  threshold: number = 200
): void {
  tree.areas.forEach((area) => {
    const totalListings = calculateAreaListingsCount(area, countsMap)

    if (totalListings < threshold) {
      statusMap.set(area.locationId, 'GARBAGE')
    }
  })
}

/**
 * Mark areas as trash if all their cities are marked as trash
 * Modifies statusMap in place
 */
export function cascadeTrashToAreas(
  tree: Tree,
  statusMap: Map<string, string>
): void {
  tree.areas.forEach((area) => {
    if (area.cities.length > 0) {
      const allCitiesAreTrash = area.cities.every((city) => {
        const cityStatus = statusMap.get(city.locationId)
        return cityStatus === 'GARBAGE'
      })

      if (allCitiesAreTrash) {
        statusMap.set(area.locationId, 'GARBAGE')
      }
    }
  })
}
