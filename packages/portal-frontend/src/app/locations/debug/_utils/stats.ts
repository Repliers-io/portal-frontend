import { type Tree } from 'services/LocationsTree'

/**
 * Count trash nodes in the tree
 */
export function countTrashNodes(
  tree: Tree,
  statusMap?: Map<string, string>
): { cities: number; neighborhoods: number; total: number } {
  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    area.cities.forEach((city) => {
      const cityStatus = statusMap?.get(city.locationId)
      if (cityStatus === 'GARBAGE') {
        cities++
      }

      city.neighborhoods.forEach((hood) => {
        const hoodStatus = statusMap?.get(hood.locationId)
        if (hoodStatus === 'GARBAGE') {
          neighborhoods++
        }
      })
    })
  })

  // Count orphaned cities
  tree.orphanedCities?.forEach((city) => {
    const cityStatus = statusMap?.get(city.locationId)
    if (cityStatus === 'GARBAGE') {
      cities++
    }

    city.neighborhoods.forEach((hood) => {
      const hoodStatus = statusMap?.get(hood.locationId)
      if (hoodStatus === 'GARBAGE') {
        neighborhoods++
      }
    })
  })

  // Count orphaned neighborhoods
  tree.orphanedNeighborhoods?.forEach((hood) => {
    const hoodStatus = statusMap?.get(hood.locationId)
    if (hoodStatus === 'GARBAGE') {
      neighborhoods++
    }
  })

  const total = cities + neighborhoods
  return { cities, neighborhoods, total }
}

/**
 * Count duplicate nodes in the tree
 */
export function countDuplicateNodes(tree: Tree): {
  cities: number
  neighborhoods: number
  total: number
} {
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
    if (count > 1) {
      cities += 1
    }
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
    if (count > 1) {
      neighborhoods += 1
    }
  })

  const total = cities + neighborhoods
  return { cities, neighborhoods, total }
}

/**
 * Count total nodes in tree (before any filtering/marking)
 */
export function countTotalTreeNodes(tree: Tree): {
  areas: number
  cities: number
  neighborhoods: number
  total: number
} {
  const areas = tree.areas.length
  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    cities += area.cities.length
    area.cities.forEach((city) => {
      neighborhoods += city.neighborhoods.length
    })
  })

  // Add orphaned
  cities += tree.orphanedCities?.length || 0
  tree.orphanedCities?.forEach((city) => {
    neighborhoods += city.neighborhoods.length
  })
  neighborhoods += tree.orphanedNeighborhoods?.length || 0

  const total = areas + cities + neighborhoods
  return { areas, cities, neighborhoods, total }
}

/**
 * Count non-trash nodes in the tree
 */
export function countNonTrashNodes(
  tree: Tree,
  statusMap?: Map<string, string>
): { areas: number; cities: number; neighborhoods: number; total: number } {
  let areas = 0
  let cities = 0
  let neighborhoods = 0

  tree.areas.forEach((area) => {
    let hasNonTrashContent = false

    area.cities.forEach((city) => {
      const cityStatus = statusMap?.get(city.locationId)
      const cityTrash = cityStatus === 'GARBAGE'

      if (!cityTrash) {
        cities++
        hasNonTrashContent = true
      }

      city.neighborhoods.forEach((hood) => {
        const hoodStatus = statusMap?.get(hood.locationId)
        if (hoodStatus !== 'GARBAGE') {
          neighborhoods++
          hasNonTrashContent = true
        }
      })
    })

    if (hasNonTrashContent) {
      areas++
    }
  })

  // Count orphaned cities
  tree.orphanedCities?.forEach((city) => {
    const cityStatus = statusMap?.get(city.locationId)
    if (cityStatus !== 'GARBAGE') {
      cities++
    }

    city.neighborhoods.forEach((hood) => {
      const hoodStatus = statusMap?.get(hood.locationId)
      if (hoodStatus !== 'GARBAGE') {
        neighborhoods++
      }
    })
  })

  // Count orphaned neighborhoods
  tree.orphanedNeighborhoods?.forEach((hood) => {
    const hoodStatus = statusMap?.get(hood.locationId)
    if (hoodStatus !== 'GARBAGE') {
      neighborhoods++
    }
  })

  const total = areas + cities + neighborhoods
  return { areas, cities, neighborhoods, total }
}
