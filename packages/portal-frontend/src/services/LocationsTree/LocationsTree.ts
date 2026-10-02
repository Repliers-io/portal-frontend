/* eslint-disable no-console */
import filtersConfig from '@configs/filters'
import locationConfig from '@configs/location'
import mapConfig from '@configs/map'

import { APILocations } from 'services/API/APILocations'
import { APISearch } from 'services/API/APISearch'
import type { ApiGeoFilters, ApiQueryParams } from 'services/API/types'

import {
  addCountsToAll,
  addTrashStatus,
  buildTree,
  cascadeTrashToAreas,
  deduplicateCities,
  filterTrash,
  generateStats,
  markAreasByThreshold,
  markTrashByCount,
  normalizeNeighborhoods,
  sortByListingsCount
} from './pipeline'
import {
  type AreaWithCities,
  type Tree,
  type TreeBuildOptions,
  type TreeMetadata,
  type TreeNode,
  type TreeResult
} from './types'

const { center } = mapConfig.proximitySearch
const { statusFilters } = filtersConfig

// ============================================================================
// Main Service Class
// ============================================================================

export class LocationsTree {
  private static readonly DEFAULT_RADIUS_KM = 4000

  private tree!: Tree
  private statusMap!: Map<string, string>
  private countsMap!: Map<string, number>
  private totalRequests = 0
  private retriedCount = 0
  private failedCount = 0

  private static elapsed(start: number): string {
    return `${((performance.now() - start) / 1000).toFixed(1)}s`
  }

  private static progressLogger(
    label: string,
    start: number
  ): (completed: number, total: number) => void {
    // The ETA is measured from this phase's own start, not from the build's:
    // counts run after fetching and deduplication, and mixing those in would
    // report a rate the phase never had.
    const phaseStart = performance.now()
    let lastLogged = 0
    return (completed: number, total: number) => {
      // Log every 10% or every 50 items, whichever comes first
      const interval = Math.max(1, Math.min(50, Math.floor(total / 10)))
      if (completed === total || completed - lastLogged >= interval) {
        lastLogged = completed

        const done = total ? Math.round((completed / total) * 100) : 100
        const spent = performance.now() - phaseStart
        const left =
          completed > 0 && completed < total
            ? `, ~${(((total - completed) * spent) / completed / 1000).toFixed(0)}s left`
            : ''

        console.log(
          `[LocationsTree] ${label}: ${completed}/${total} ${done}% (${LocationsTree.elapsed(start)}${left})`
        )
      }
    }
  }

  /**
   * Calculate date 90 days ago from today
   */
  private static getMinListDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - 90)
    return date.toISOString().split('T')[0]
  }

  /**
   * Fetch listings count for a location
   */
  private static async fetchListingsCount(
    params: ApiGeoFilters,
    attempt = 0,
    instance?: LocationsTree
  ): Promise<{ count: number; lastUpdatedOn?: string }> {
    try {
      const apiParams: Partial<ApiQueryParams> = {
        ...(locationConfig.activeCounts
          ? statusFilters.active
          : {
              ...statusFilters.any,
              minListDate: LocationsTree.getMinListDate()
            }),
        ...params
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await APISearch.fetchListingsCount(apiParams, {
          next: { revalidate: 3600 },
          cache: 'force-cache',
          signal: controller.signal
        })
        if (attempt > 0 && instance) instance.retriedCount++
        return {
          count: response.count ?? 0,
          lastUpdatedOn: response.lastUpdatedOn
        }
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error: unknown) {
      const status =
        error != null && typeof error === 'object' && 'status' in error
          ? (error as { status: number }).status
          : null

      if (status === 429 && attempt < 4) {
        const delayMs = 2000 * 2 ** attempt
        console.warn(
          `429 rate-limited for ${JSON.stringify(params)}, retrying in ${delayMs}ms (attempt ${attempt + 1})`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        return LocationsTree.fetchListingsCount(params, attempt + 1, instance)
      }

      console.error('Error fetching count for location:', params, error)
      if (instance) instance.failedCount++
      return { count: -1 }
    }
  }

  /**
   * Fetch all locations with automatic pagination
   * Uses APILocations.fetchAllPages for proper data fetching
   */
  private async fetchLocations(): Promise<TreeNode[]> {
    const locations = await APILocations.fetchAllPages({
      lat: center.lat,
      long: center.lng,
      radius: LocationsTree.DEFAULT_RADIUS_KM,
      type: [
        'area',
        ...locationConfig.cityTypes,
        ...locationConfig.neighborhoodTypes
      ]
    })

    // APILocations already handles pagination and deduplication
    // Just return the locations as TreeNode[]
    return locations as TreeNode[]
  }

  /**
   * Build complete location tree with all processing steps
   */
  async buildTree(options: TreeBuildOptions = {}): Promise<TreeResult> {
    const startTime = performance.now()

    // Default options
    const {
      checkOrphans = true,
      hideTrash = false,
      debug = false,
      sortByCount = false,
      checkAll = false,
      skipNeighborhoods = false,
      areaThreshold = 200
    } = options

    const log = (msg: string) =>
      console.log(
        `[LocationsTree] ${msg} (${LocationsTree.elapsed(startTime)})`
      )

    // Reset state
    this.totalRequests = 0
    this.retriedCount = 0
    this.failedCount = 0
    this.statusMap = new Map()
    this.countsMap = new Map()

    // STEP 1: Fetch all locations from API
    log('fetching locations...')
    const locations = await this.fetchLocations()
    log(`fetched ${locations.length} locations`)

    // Determine if orphans are needed for this build
    const includeOrphans = checkOrphans || checkAll || hideTrash || debug

    // STEP 2: Build initial tree
    this.tree = buildTree(
      locations,
      sortByCount,
      includeOrphans,
      locationConfig.hoodsByArea
    )
    log(
      `tree built: ${this.tree.areas.length} areas, ` +
        `${this.tree.areas.reduce((s, a) => s + a.cities.length, 0)} cities`
    )

    // STEP 2.5: If no areas found, create synthetic area from orphaned cities
    if (this.tree.areas.length === 0 && this.tree.orphanedCities?.length) {
      log(`no areas found — creating synthetic area '${locationConfig.city}'`)
      const syntheticArea: AreaWithCities = {
        locationId: 'synthetic',
        name: locationConfig.city,
        type: 'area',
        cities: this.tree.orphanedCities
      }
      this.tree.areas = [syntheticArea]
      this.tree.orphanedCities = []
    }

    // STEP 3: Deduplicate cities (Ottawa issue)
    deduplicateCities(this.tree)

    // STEP 4: Normalize duplicate neighborhoods
    normalizeNeighborhoods(this.tree)

    // STEP 5: Add trash status for duplicates/orphans
    log('checking duplicates/orphans...')

    const requestCount = await addTrashStatus(
      this.tree,
      this.statusMap,
      this.countsMap,
      {
        checkOrphans,
        fetchListingsCount: (p) => LocationsTree.fetchListingsCount(p, 0, this),
        onProgress: LocationsTree.progressLogger('trash check', startTime)
      }
    )
    this.totalRequests += requestCount
    log(`trash check done, ${requestCount} requests`)

    // STEP 6-10: Optional - if checkAll is enabled
    if (checkAll) {
      // STEP 6: Fetch counts for ALL locations
      log('fetching counts for all locations...')
      const result = await addCountsToAll(this.tree, this.countsMap, {
        fetchListingsCount: (p) => LocationsTree.fetchListingsCount(p, 0, this),
        skipNeighborhoods,
        onProgress: LocationsTree.progressLogger('counts', startTime)
      })
      this.totalRequests += result
      log(`counts done, ${result} requests`)

      // STEP 7: Mark trash by zero counts
      markTrashByCount(this.statusMap, this.countsMap)

      // STEP 8: Cascade trash to areas
      cascadeTrashToAreas(this.tree, this.statusMap)

      // STEP 9: Mark areas by threshold
      markAreasByThreshold(
        this.tree,
        this.statusMap,
        this.countsMap,
        areaThreshold
      )

      // STEP 10: Sort by listings count (if enabled)
      if (sortByCount) sortByListingsCount(this.tree, this.countsMap)
    }

    // STEP 12: Filter trash if hideTrash is enabled
    if (hideTrash) filterTrash(this.tree, this.statusMap)
    log('filtering complete')

    // Remove debug info if not needed
    if (!debug) {
      delete this.tree.orphanedCities
      delete this.tree.orphanedNeighborhoods
    }

    // Calculate total listings
    const totalListings = Array.from(this.countsMap.values()).reduce(
      (sum, count) => (count >= 0 ? sum + count : sum),
      0
    )

    // Generate statistics only if debug is enabled
    const stats = debug
      ? generateStats(
          this.tree,
          this.statusMap,
          this.countsMap,
          locations.length
        )
      : undefined

    const endTime = performance.now()
    const processingTime = Math.round(endTime - startTime)

    const metadata: TreeMetadata = {
      requestCount: this.totalRequests,
      processingTime,
      totalListings,
      retriedCount: this.retriedCount,
      failedCount: this.failedCount
    }

    return {
      tree: this.tree,
      statusMap: this.statusMap,
      countsMap: this.countsMap,
      stats,
      metadata
    }
  }
}
