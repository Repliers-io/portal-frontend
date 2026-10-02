'use client'

import { useState } from 'react'
import { type LngLatBounds } from 'mapbox-gl'

import { type Filters } from 'services/Search'
import { useAiSearch } from 'providers/AiSearchProvider'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import {
  fitBounds,
  getLocationsBounds,
  getPointBounds,
  toMapboxBounds
} from 'utils/map'

import { type ChatItem } from '../types'
import {
  extractImageSearchItems,
  extractPointParams,
  hasGeoFilters
} from '../utils'

export const useApplyFilters = () => {
  const { mapRef, setCenterEnabled } = useMapOptions()
  const { setLocations } = useMapLocations()
  const { setFilters, setPoint } = useSearch()
  const { submit: aiSubmit } = useAiSearch()
  const [applying, setApplying] = useState(false)

  const applyFilters = async (item: ChatItem) => {
    const map = mapRef.current
    const { params, body, locations = null, aggregates } = item
    setApplying(true)

    const filtersWithBody = { ...params, ...body } as Partial<Filters>

    // Extract point parameters (if present) from filters
    const { point, filters: filtersWithoutPoint } =
      extractPointParams(filtersWithBody)

    // Check if we have geo-location filters
    const hasGeo = hasGeoFilters(filtersWithoutPoint)

    // Determine which filters to apply
    // If we have geo-filters, remove point coordinates from filters
    const filtersToApply = hasGeo ? filtersWithoutPoint : filtersWithBody

    // Defer map movement to avoid lag after applying filters
    // Use requestAnimationFrame to ensure DOM updates happen first

    let bounds: LngLatBounds | null = null

    if (hasGeo) {
      // Frame all selected locations — combines polygon extents and point-only
      // marker centres (getLocationsBounds), unlike the old all-or-nothing
      // boundary path that skipped framing when any location lacked a polygon.
      if (locations?.length) bounds = getLocationsBounds(locations)

      // Fallback to cluster bounds when no location geometry is available
      if (!bounds && aggregates?.map?.clusters?.[0]) {
        bounds = toMapboxBounds(aggregates.map.clusters[0].bounds)
      }

      // Save locations and bounds for MapTitle to render
      setLocations(locations)
    } else if (point) {
      bounds = getPointBounds(point)
    }

    if (map && bounds) {
      // Disable recenter button immediately before positioning
      setCenterEnabled(false)

      fitBounds(map, bounds)
      // Wait for map movement to complete, then enable recenter button
      await new Promise<void>((resolve) => {
        map.once('moveend', () => {
          setCenterEnabled(true)
          resolve()
        })
      })
    } else {
      // empty promise
      // Wait for next tick to allow filters to be applied
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    // Apply filters after map movement completes
    if (point && !hasGeo) setPoint(point)

    // Sync AiSearchProvider if imageSearchItems are present
    const { images, features } = extractImageSearchItems(
      filtersToApply.imageSearchItems
    )
    if (images.length || features.length) {
      aiSubmit({ images, features })
    }

    setFilters(filtersToApply)
    setApplying(false)
  }

  return { applyFilters, applying }
}
