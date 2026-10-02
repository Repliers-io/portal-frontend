/**
 * LocationsTree Pipeline: Build
 *
 * Builds hierarchical tree from flat locations array
 */

import { type Tree, type TreeNode } from '../types'

// ============================================================================
// Helper Functions
// ============================================================================

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function hoodKey(area: string, city: string): string {
  return `${norm(area)}::${norm(city)}`
}

/**
 * Apply hardcoded fixes to location data
 */
function applyHardcodes(locations: TreeNode[]): void {
  locations.forEach((loc) => {
    // HARDCODE: Override area to "Ottawa" for all locations with city="Ottawa"
    if (loc.address?.city === 'Ottawa' && !loc.address?.area) {
      loc.address.area = 'Ottawa'
    }
  })
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build hierarchical tree from flat locations array
 *
 * `hoodsByArea`: hang every neighbourhood under the city of its area, matched by
 * `address.area` alone (ignoring `address.city`) — for sources whose neighbourhoods
 * carry a postal `address.city` that names no city of the tree (see
 * `@configs/location`'s `hoodsByArea`). Assumes one city per area.
 */
export function buildTree(
  locations: TreeNode[],
  sortByCount = false,
  includeOrphans = true,
  hoodsByArea = false
): Tree {
  // Apply hardcodes
  applyHardcodes(locations)

  // Separate by type
  const areas = locations.filter((loc) => loc.type === 'area')
  const cities = locations.filter(
    (loc) => loc.type === 'city' || loc.type === 'city-alternate'
  )
  const neighborhoods = locations.filter(
    (loc) =>
      loc.type === 'neighborhood' || loc.type === 'neighborhood-alternate'
  )

  // OPTIMIZATION: Pre-index neighborhoods by area+city key
  // This reduces O(A×C×N) to O(A×C + N)
  const hoodsByAreaCity = new Map<string, TreeNode[]>()
  neighborhoods.forEach((hood) => {
    const key = hoodKey(hood.address?.area || '', hood.address?.city || '')
    if (!hoodsByAreaCity.has(key)) {
      hoodsByAreaCity.set(key, [])
    }
    hoodsByAreaCity.get(key)!.push(hood)
  })

  // Index by area alone, for hoodsByArea
  const hoodsByAreaName = new Map<string, TreeNode[]>()
  neighborhoods.forEach((hood) => {
    const area = norm(hood.address?.area || '')
    if (!hoodsByAreaName.has(area)) {
      hoodsByAreaName.set(area, [])
    }
    hoodsByAreaName.get(area)!.push(hood)
  })

  // Build tree structure: Areas -> Cities -> Neighborhoods
  const areasTree = areas.map((area) => {
    const areaCities = cities.filter(
      (city) => norm(city.address?.area || '') === norm(area.name)
    )
    return {
      ...area,
      cities: areaCities.map((city) => {
        // Use pre-built index instead of filter: O(1) lookup
        const cityNeighborhoods = hoodsByArea
          ? hoodsByAreaName.get(norm(area.name)) || []
          : hoodsByAreaCity.get(hoodKey(area.name, city.name)) || []

        return {
          ...city,
          neighborhoods: cityNeighborhoods
        }
      })
    }
  })

  // Build orphaned collections only if requested
  let orphanedCitiesTree: Array<TreeNode & { neighborhoods: TreeNode[] }> = []
  let orphanedNeighborhoods: TreeNode[] = []

  if (includeOrphans) {
    // Find orphaned cities (no area parent)
    const citiesInTree = new Set<string>()
    areasTree.forEach((area) => {
      area.cities.forEach((city) => {
        citiesInTree.add(city.locationId)
      })
    })
    const orphanedCities = cities.filter(
      (city) => !citiesInTree.has(city.locationId)
    )

    // Build neighborhood structure for orphaned cities
    orphanedCitiesTree = orphanedCities.map((city) => {
      // STRICT match only: city + area must match
      // Use pre-built index: O(1) lookup
      const key = hoodKey(city.address?.area || '', city.name)
      const cityNeighborhoods = hoodsByAreaCity.get(key) || []

      return {
        ...city,
        neighborhoods: cityNeighborhoods
      }
    })

    // Find orphaned neighborhoods (no city or area parent)
    const neighborhoodsInTree = new Set<string>()
    areasTree.forEach((area) => {
      area.cities.forEach((city) => {
        city.neighborhoods.forEach((hood) => {
          neighborhoodsInTree.add(hood.locationId)
        })
      })
    })
    orphanedCitiesTree.forEach((city) => {
      city.neighborhoods.forEach((hood) => {
        neighborhoodsInTree.add(hood.locationId)
      })
    })
    orphanedNeighborhoods = neighborhoods.filter(
      (hood) => !neighborhoodsInTree.has(hood.locationId)
    )
  }

  // Sort everything
  if (sortByCount) {
    // Sort by children count (descending)
    areasTree.sort((a, b) => b.cities.length - a.cities.length)
    areasTree.forEach((area) => {
      area.cities.sort(
        (a, b) => b.neighborhoods.length - a.neighborhoods.length
      )
      // Neighborhoods don't have children, sort alphabetically
      area.cities.forEach((city) => {
        city.neighborhoods.sort((a, b) => a.name.localeCompare(b.name))
      })
    })
    if (includeOrphans) {
      orphanedCitiesTree.sort(
        (a, b) => b.neighborhoods.length - a.neighborhoods.length
      )
      orphanedCitiesTree.forEach((city) => {
        city.neighborhoods.sort((a, b) => a.name.localeCompare(b.name))
      })
      orphanedNeighborhoods.sort((a, b) => a.name.localeCompare(b.name))
    }
  } else {
    // Sort alphabetically
    areasTree.sort((a, b) => a.name.localeCompare(b.name))
    areasTree.forEach((area) => {
      area.cities.sort((a, b) => a.name.localeCompare(b.name))
      area.cities.forEach((city) => {
        city.neighborhoods.sort((a, b) => a.name.localeCompare(b.name))
      })
    })
    if (includeOrphans) {
      orphanedCitiesTree.sort((a, b) => a.name.localeCompare(b.name))
      orphanedCitiesTree.forEach((city) => {
        city.neighborhoods.sort((a, b) => a.name.localeCompare(b.name))
      })
      orphanedNeighborhoods.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  return includeOrphans
    ? {
        areas: areasTree,
        orphanedCities: orphanedCitiesTree,
        orphanedNeighborhoods
      }
    : {
        areas: areasTree
      }
}
