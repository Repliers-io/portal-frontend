/**
 * LocationsTree Service Types
 *
 * Type definitions for the locations tree building service
 */

import { type ApiLocation } from 'services/API/types'

// ============================================================================
// Base Location Types
// ============================================================================

export interface TreeNode extends ApiLocation {
  duplicateLocationIds?: string[]
}

/**
 * A neighbour carries the city that owns it: nearby lookups cross city lines, and
 * a neighbourhood of another city needs that city in its `/city/hood` link.
 */
export type LocationWithDistance = ApiLocation & {
  distance: number
  city?: string
}

/** Tree node offered to a nearby lookup, tagged with its parent city. */
export type NearbyCandidate = TreeNode & { city?: string }

// ============================================================================
// Tree Structure Types
// ============================================================================

export interface CityWithNeighborhoods extends TreeNode {
  neighborhoods: TreeNode[]
}

export interface AreaWithCities extends TreeNode {
  cities: CityWithNeighborhoods[]
}

export interface Tree {
  areas: AreaWithCities[]
  orphanedCities?: CityWithNeighborhoods[]
  orphanedNeighborhoods?: TreeNode[]
  stats?: {
    totalLocations: number
    totalAreas: number
    totalCities: number
    totalNeighborhoods: number
    citiesInAreas: number
    neighborhoodsInAreas: number
    orphanedCitiesCount: number
    orphanedNeighborhoodsCount: number
  }
}

// ============================================================================
// Options
// ============================================================================

export interface TreeBuildOptions {
  // Filtering options
  checkOrphans?: boolean // Check orphaned locations (default: true)
  hideTrash?: boolean // Hide trash in final output (default: false)

  // Debug options
  debug?: boolean // Include debug info (orphans, stats) (default: false)

  // Sorting options
  sortByCount?: boolean // Sort by listings count (default: false)

  // Counts options
  checkAll?: boolean // Fetch counts for all locations (default: false)
  skipNeighborhoods?: boolean // Skip fetching neighborhood counts (default: false)

  // Threshold options
  areaThreshold?: number // Min listings for area (default: 200)
  cityThreshold?: number // Min listings for city (optional)
  neighborhoodThreshold?: number // Min listings for neighborhood (optional)
}

// ============================================================================
// Results
// ============================================================================

export interface NodeCounts {
  total: number
  areas: number
  cities: number
  neighborhoods: number
}

export interface TreeMetadata {
  requestCount: number
  processingTime: number
  totalListings: number
  retriedCount: number
  failedCount: number
}

export interface TreeStats {
  apiLocationsCount: number
  totalNodes: NodeCounts
  duplicateNodes: NodeCounts
  trashNodes: NodeCounts
  nonTrashNodes: NodeCounts
  treeSizeBytes: number
}

export interface TreeResult {
  tree: Tree
  statusMap: Map<string, string>
  countsMap: Map<string, number>
  stats?: TreeStats
  metadata: TreeMetadata
}

// ============================================================================
// Pipeline Step Results
// ============================================================================

export interface StatusResult {
  statusMap: Map<string, string>
  countsMap: Map<string, number>
  requestCount: number
}

export interface CountsResult {
  countsMap: Map<string, number>
  requestCount: number
}
