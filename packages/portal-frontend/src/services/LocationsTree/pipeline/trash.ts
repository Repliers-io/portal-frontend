/**
 * LocationsTree Pipeline: Trash Status
 *
 * Adds trash status indicators for duplicates and orphans
 * based on listings counts
 */

import { type ApiGeoFilters } from 'services/API/types'

import { type Tree } from '../types'

import { runThrottled } from './concurrency'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if location has duplicates
 */
function hasDuplicates(
  loc: unknown
): loc is { duplicateLocationIds: string[] } {
  const locWithDups = loc as { duplicateLocationIds?: string[] }
  return (
    !!locWithDups.duplicateLocationIds &&
    locWithDups.duplicateLocationIds.length > 0
  )
}

/**
 * Mark all duplicates as trash except the one with highest count
 * Marks as trash any duplicate with count < 50% of max count
 */
function markDuplicatesAsTrash(
  locationIds: string[],
  countsMap: Map<string, number>,
  statusMap: Map<string, string>
): void {
  if (locationIds.length <= 1) return

  // Sort by count descending
  const sorted = [...locationIds].sort((a, b) => {
    const countA = countsMap.get(a) ?? 0
    const countB = countsMap.get(b) ?? 0
    return countB - countA
  })

  const maxCount = countsMap.get(sorted[0]) ?? 0
  const threshold = maxCount / 2

  // Mark all locations with count < 50% of max as trash
  for (let i = 1; i < sorted.length; i++) {
    const count = countsMap.get(sorted[i]) ?? 0
    if (count < threshold) {
      statusMap.set(sorted[i], 'DUPLICATE')
    }
  }
}

/**
 * Build index of cities by name to detect duplicates across areas
 */
function buildCityIndex(tree: Tree) {
  type CityInfo = { city: (typeof tree.areas)[0]['cities'][0]; area: string }
  const citiesByName = new Map<string, CityInfo[]>()

  for (const area of tree.areas) {
    for (const city of area.cities) {
      if (!citiesByName.has(city.name)) {
        citiesByName.set(city.name, [])
      }
      citiesByName.get(city.name)!.push({ city, area: area.name })
    }
  }

  return citiesByName
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Mark locations with zero listings as GARBAGE
 * Modifies statusMap in place
 */
export function markTrashByCount(
  statusMap: Map<string, string>,
  countsMap: Map<string, number>
): void {
  countsMap.forEach((count, locationId) => {
    // Mark as trash if count is exactly 0
    if (count === 0) {
      statusMap.set(locationId, 'GARBAGE')
    }
  })
}

/**
 * Add trash status indicators to tree locations
 * ONLY checks:
 * - Duplicates (have duplicateLocationIds property)
 * - Orphaned cities or neighborhoods (if checkOrphans is true)
 */
export async function addTrashStatus(
  tree: Tree,
  statusMap: Map<string, string>,
  countsMap: Map<string, number>,
  options: {
    checkOrphans?: boolean
    fetchListingsCount: (
      params: ApiGeoFilters
    ) => Promise<{ count: number; lastUpdatedOn?: string }>
    onProgress?: (completed: number, total: number) => void
  }
): Promise<number> {
  const { checkOrphans = true, fetchListingsCount, onProgress } = options

  // Build city index for cross-area duplicate detection
  const citiesByName = buildCityIndex(tree)

  type FetchTask = () => Promise<void>
  const tasks: FetchTask[] = []

  // Collect tasks: cities with duplicates
  for (const area of tree.areas) {
    for (const city of area.cities) {
      const sameName = citiesByName.get(city.name) || []
      const hasDuplicatesInDifferentAreas = sameName.length > 1
      const hasDuplicatesInSameArea = hasDuplicates(city)

      if (hasDuplicatesInDifferentAreas || hasDuplicatesInSameArea) {
        // Fetch main city by locationId
        const capturedCityId = city.locationId
        tasks.push(async () => {
          const result = await fetchListingsCount({
            locationId: capturedCityId
          })
          countsMap.set(capturedCityId, result.count)
        })

        // Fetch each same-area duplicate by its own locationId
        if (hasDuplicatesInSameArea) {
          const cityWithDups = city as { duplicateLocationIds: string[] }
          for (const dupId of cityWithDups.duplicateLocationIds) {
            const capturedDupId = dupId
            tasks.push(async () => {
              const result = await fetchListingsCount({
                locationId: capturedDupId
              })
              countsMap.set(capturedDupId, result.count)
            })
          }
        }
      }

      // Neighborhoods with duplicates
      for (const hood of city.neighborhoods) {
        if (hasDuplicates(hood)) {
          const capturedHoodId = hood.locationId
          tasks.push(async () => {
            const result = await fetchListingsCount({
              locationId: capturedHoodId
            })
            countsMap.set(capturedHoodId, result.count)
          })

          const hoodWithDups = hood as { duplicateLocationIds: string[] }
          for (const dupId of hoodWithDups.duplicateLocationIds) {
            const capturedDupId = dupId
            tasks.push(async () => {
              const result = await fetchListingsCount({
                locationId: capturedDupId
              })
              countsMap.set(capturedDupId, result.count)
            })
          }
        }
      }
    }
  }

  // Collect tasks: orphaned cities + their neighborhoods
  if (checkOrphans && tree.orphanedCities) {
    for (const city of tree.orphanedCities) {
      const capturedCityId = city.locationId

      // Orphaned city itself
      tasks.push(async () => {
        const result = await fetchListingsCount({ locationId: capturedCityId })
        countsMap.set(capturedCityId, result.count)
        statusMap.set(capturedCityId, 'ORPHAN')
      })

      // All neighborhoods of orphaned city
      for (const hood of city.neighborhoods) {
        const capturedHoodId = hood.locationId
        tasks.push(async () => {
          const result = await fetchListingsCount({
            locationId: capturedHoodId
          })
          countsMap.set(capturedHoodId, result.count)
        })

        if (hasDuplicates(hood)) {
          const hoodWithDups = hood as { duplicateLocationIds: string[] }
          for (const dupId of hoodWithDups.duplicateLocationIds) {
            const capturedDupId = dupId
            tasks.push(async () => {
              const result = await fetchListingsCount({
                locationId: capturedDupId
              })
              countsMap.set(capturedDupId, result.count)
            })
          }
        }
      }
    }

    // Orphaned neighborhoods
    if (tree.orphanedNeighborhoods) {
      for (const hood of tree.orphanedNeighborhoods) {
        const capturedHoodId = hood.locationId
        tasks.push(async () => {
          const result = await fetchListingsCount({
            locationId: capturedHoodId
          })
          countsMap.set(capturedHoodId, result.count)
          statusMap.set(capturedHoodId, 'ORPHAN')
        })
      }
    }
  }

  // Rate- and concurrency-limited: see runThrottled
  await runThrottled(tasks, onProgress)

  // Now mark duplicates as trash (keep only highest count)
  // Process cities with duplicates in same area
  for (const area of tree.areas) {
    for (const city of area.cities) {
      if (hasDuplicates(city)) {
        const cityWithDups = city as { duplicateLocationIds: string[] }
        const allDupIds = [
          city.locationId,
          ...cityWithDups.duplicateLocationIds
        ]
        markDuplicatesAsTrash(allDupIds, countsMap, statusMap)
      }

      // Process neighborhoods with duplicates
      for (const hood of city.neighborhoods) {
        if (hasDuplicates(hood)) {
          const hoodWithDups = hood as { duplicateLocationIds: string[] }
          const allDupIds = [
            hood.locationId,
            ...hoodWithDups.duplicateLocationIds
          ]
          markDuplicatesAsTrash(allDupIds, countsMap, statusMap)
        }
      }
    }
  }

  // Process duplicates in orphaned cities
  if (tree.orphanedCities) {
    for (const city of tree.orphanedCities) {
      for (const hood of city.neighborhoods) {
        if (hasDuplicates(hood)) {
          const hoodWithDups = hood as { duplicateLocationIds: string[] }
          const allDupIds = [
            hood.locationId,
            ...hoodWithDups.duplicateLocationIds
          ]
          markDuplicatesAsTrash(allDupIds, countsMap, statusMap)
        }
      }
    }
  }

  // Process cities with same name in different areas
  citiesByName.forEach((cities) => {
    if (cities.length > 1) {
      const cityIds = cities.map((c) => c.city.locationId)
      markDuplicatesAsTrash(cityIds, countsMap, statusMap)
    }
  })

  return tasks.length
}
