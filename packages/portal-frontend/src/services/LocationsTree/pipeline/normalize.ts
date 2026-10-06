/**
 * LocationsTree Pipeline: Normalize
 *
 * Normalizes duplicate neighborhoods within cities
 */

import { type Tree, type TreeNode } from '../types'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Deduplicate neighborhoods array by name
 * Keeps the one with boundary if available, otherwise keeps first
 */
function deduplicateNeighborhoods(neighborhoods: TreeNode[]): TreeNode[] {
  const byName = new Map<string, TreeNode[]>()
  neighborhoods.forEach((hood) => {
    if (!byName.has(hood.name)) {
      byName.set(hood.name, [])
    }
    byName.get(hood.name)!.push(hood)
  })

  const deduplicated: TreeNode[] = []

  byName.forEach((hoods) => {
    if (hoods.length === 1) {
      // No duplicates - keep as is
      deduplicated.push(hoods[0])
      return
    }

    // Find if any has boundary
    const withBoundary = hoods.find((h) => h.map?.boundary)
    const kept = withBoundary || hoods[0] // Keep one with boundary, or first

    // Collect duplicate IDs
    const duplicateIds = hoods
      .filter((h) => h.locationId !== kept.locationId)
      .map((h) => h.locationId)

    // Add duplicates array to kept neighborhood
    deduplicated.push({
      ...kept,
      duplicateLocationIds: duplicateIds
    })
  })

  return deduplicated
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Normalize duplicate neighborhoods within cities (mutates tree in place)
 * Removes duplicates and stores duplicate IDs
 */
export function normalizeNeighborhoods(tree: Tree): void {
  // Process all cities in areas
  tree.areas.forEach((area) => {
    area.cities.forEach((city) => {
      city.neighborhoods = deduplicateNeighborhoods(city.neighborhoods)
    })
  })

  // Process orphaned cities
  if (tree.orphanedCities) {
    tree.orphanedCities.forEach((city) => {
      city.neighborhoods = deduplicateNeighborhoods(city.neighborhoods)
    })
  }
}
