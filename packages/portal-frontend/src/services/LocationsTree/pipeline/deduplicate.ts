/**
 * LocationsTree Pipeline: Deduplicate
 *
 * Deduplicates cities in the tree (e.g., Ottawa issue)
 */

import { type CityWithNeighborhoods, type Tree } from '../types'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if two cities are duplicates (same name and location)
 */
function areCitiesDuplicates(
  city1: CityWithNeighborhoods,
  city2: CityWithNeighborhoods
): boolean {
  // Same name
  if (city1.name !== city2.name) return false

  // Check if they have the same boundary coordinates
  const boundary1 = city1.map?.boundary
  const boundary2 = city2.map?.boundary

  if (!boundary1 || !boundary2) return false
  if (boundary1.length !== boundary2.length) return false

  // Compare all coordinates (boundary is [number, number][][])
  return boundary1.every((polygon, i) => {
    const otherPolygon = boundary2[i]
    if (!otherPolygon) return false
    if (polygon.length !== otherPolygon.length) return false
    return polygon.every(
      (coord, j) =>
        coord[0] === otherPolygon[j][0] && coord[1] === otherPolygon[j][1]
    )
  })
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Deduplicate cities in tree (mutates tree in place)
 * Merges duplicate cities by combining their neighborhoods
 * and tracking duplicate locationIds
 */
export function deduplicateCities(tree: Tree): void {
  tree.areas.forEach((area) => {
    const uniqueCities: typeof area.cities = []
    const processedCityNames = new Set<string>()

    area.cities.forEach((city) => {
      // Skip if already processed
      if (processedCityNames.has(city.name)) {
        return
      }

      // Find all duplicates of this city
      const duplicates = area.cities.filter(
        (other) =>
          other.locationId !== city.locationId &&
          areCitiesDuplicates(city, other)
      )

      if (duplicates.length > 0) {
        // Merge neighborhoods from all duplicates
        const allNeighborhoods = [...city.neighborhoods]
        const duplicateIds = duplicates.map((dup) => {
          allNeighborhoods.push(...dup.neighborhoods)
          return dup.locationId
        })

        // Create merged city with duplicate tracking
        uniqueCities.push({
          ...city,
          neighborhoods: allNeighborhoods,
          duplicateLocationIds: duplicateIds
        })
      } else {
        // No duplicates, keep as is
        uniqueCities.push(city)
      }

      processedCityNames.add(city.name)
    })

    area.cities = uniqueCities
  })
}
