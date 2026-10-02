/**
 * Filter Trash Step
 *
 * Removes trash locations from the tree if hideTrash option is enabled
 */

import { type Tree } from '../types'

/**
 * Filter out trash locations from the tree (mutates tree in place)
 * Removes areas, cities, and neighborhoods marked as trash in statusMap
 * statusMap contains string values like 'DUPLICATE', 'ORPHAN', 'GARBAGE' - all truthy = trash
 */
export function filterTrash(tree: Tree, statusMap: Map<string, string>): void {
  // Helper to check if location has trash status (has any status)
  const hasTrashStatus = (locationId: string): boolean => {
    return !!statusMap.get(locationId)
  }

  // Filter areas and their children
  tree.areas = tree.areas.filter((area) => {
    // Skip trash areas
    if (hasTrashStatus(area.locationId)) return false

    // Filter cities in area
    area.cities = area.cities.filter((city) => {
      if (hasTrashStatus(city.locationId)) return false

      // Filter neighborhoods in city
      if (city.neighborhoods) {
        city.neighborhoods = city.neighborhoods.filter((hood) => {
          return !hasTrashStatus(hood.locationId)
        })
      }

      return true
    })

    // Only include area if it has cities
    return area.cities.length > 0
  })

  // Filter orphaned cities
  if (tree.orphanedCities) {
    tree.orphanedCities = tree.orphanedCities.filter((city) => {
      if (hasTrashStatus(city.locationId)) return false

      // Filter neighborhoods in orphaned city
      if (city.neighborhoods) {
        city.neighborhoods = city.neighborhoods.filter((hood) => {
          return !hasTrashStatus(hood.locationId)
        })
      }

      return true
    })
  }

  // Filter orphaned neighborhoods
  if (tree.orphanedNeighborhoods) {
    tree.orphanedNeighborhoods = tree.orphanedNeighborhoods.filter((hood) => {
      return !hasTrashStatus(hood.locationId)
    })
  }
}
