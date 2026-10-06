import { useCallback, useRef } from 'react'

import { type ApiLocation, locationTypes } from 'services/API'
import { type Filters, locationFilterKeys } from 'services/Search'
import { useMapLocations } from 'providers/MapOptionsProvider'
import { useSearchActions } from 'providers/SearchProvider'
import { splitSelectionIds } from 'utils/map/externalLocations'

/**
 * Toggle a location in the selection list by `locationId`. Adds when absent,
 * removes when present. Selection across types/layers is independent — no
 * incompatible-type clearing (unlike the deprecated legacy location selector).
 */
export const toggleLocationInList = (
  locations: ApiLocation[] | null,
  location: ApiLocation
): ApiLocation[] => {
  const current = locations ?? []
  return current.some((l) => l.locationId === location.locationId)
    ? current.filter((l) => l.locationId !== location.locationId)
    : [...current, location]
}

/**
 * Canonical writer of the shared map-location selection state
 * (`MapOptionsProvider.locations` + the `locationId` search filter). Both the
 * new overlay-marker selection and any future entry point go through this.
 */
export const useLocationSelection = () => {
  const { locations, setLocations, clearLocations } = useMapLocations()
  // Actions only (stable identity) — keeps this hook, and the overlay controller
  // that hosts it, from re-rendering on every `filters`/`listings` change.
  const { addFilters, removeFilters, clearPoint, clearPolygon } =
    useSearchActions()

  // The writers are wired into map handlers that are registered once (markers /
  // GL click handlers don't re-render when the selection changes). Reading these
  // through a ref keeps the callbacks stable and always-fresh — without it a
  // click would operate on a stale `locations` snapshot and replace the
  // selection instead of adding to it.
  const ref = useRef({
    locations,
    setLocations,
    clearLocations,
    addFilters,
    removeFilters,
    clearPoint,
    clearPolygon
  })
  ref.current = {
    locations,
    setLocations,
    clearLocations,
    addFilters,
    removeFilters,
    clearPoint,
    clearPolygon
  }

  // Drop every location filter key from the search query — no visual change.
  // Use when the query must stop being location-scoped but the title/visual is
  // managed elsewhere (e.g. the draw tool keeps its own "edit polygon" title).
  const clearLocationFilters = useCallback((): void => {
    ref.current.removeFilters([...locationFilterKeys])
  }, [])

  // Clear the whole selection: empties `locations` (and the MapTitle) and drops
  // every location filter (legacy name paths + modern locationId).
  const clearSelection = useCallback((): void => {
    ref.current.clearLocations()
    clearLocationFilters()
  }, [clearLocationFilters])

  // Canonical "commit a selection" primitive: write `locations` and keep the
  // `locationId`/`externalLocationId` listing filters in sync. Every selection
  // entry point goes through this (or `toggleLocation`/`clearSelection`, which
  // build on it) so the selection ↔ filter coupling lives in exactly one place.
  const selectLocations = useCallback(
    (next: ApiLocation[] | null): void => {
      const list = next ?? []
      if (!list.length) {
        clearSelection()
        return
      }
      ref.current.setLocations(list)
      // Native ids constrain via `locationId` (Repliers), external ids via
      // `externalLocationId` (resolved to polygons in getSearchArea). An empty
      // side must drop its key, or a stale filter would keep constraining.
      const { locationId, externalLocationId } = splitSelectionIds(list)
      const filters: Filters = {}
      if (locationId.length) filters.locationId = locationId
      if (externalLocationId.length) {
        filters.externalLocationId = externalLocationId
      }
      // Replacing a selection drops any stale legacy name filters first, so a
      // modern locationId and a leftover area/city/name can't both constrain.
      const emptied: (keyof Filters)[] = [
        ...(locationId.length ? [] : ['locationId' as const]),
        ...(externalLocationId.length ? [] : ['externalLocationId' as const])
      ]
      ref.current.clearPoint()
      // A committed location selection replaces any drawn/loaded search polygon
      // (a loaded saved search IS a polygon) — they must not both constrain.
      ref.current.clearPolygon()
      ref.current.removeFilters([...locationTypes, 'location', ...emptied])
      ref.current.addFilters(filters)
    },
    [clearSelection]
  )

  // Merge resolved data (e.g. an external location's fetched boundary) into an
  // already-selected location. No filter writes — the id set is unchanged.
  const patchLocation = useCallback(
    (locationId: string, patch: Partial<ApiLocation>): void => {
      const current = ref.current.locations ?? []
      if (!current.some((l) => l.locationId === locationId)) return
      ref.current.setLocations(
        current.map((l) =>
          l.locationId === locationId ? { ...l, ...patch } : l
        )
      )
    },
    []
  )

  // Add the location when absent, remove it when present (independent selection —
  // no incompatible-type clearing). Returns whether it is selected afterwards, so
  // callers can sync derived UI (e.g. the polygon's `selected` feature-state).
  const toggleLocation = useCallback(
    (location: ApiLocation): boolean => {
      const next = toggleLocationInList(ref.current.locations, location)
      selectLocations(next)
      return next.some((l) => l.locationId === location.locationId)
    },
    [selectLocations]
  )

  // Peek the current selection state without mutating it — lets a click handler
  // paint the polygon feature-state before the (heavier) toggle runs.
  const locationSelected = useCallback(
    (locationId: string): boolean =>
      (ref.current.locations ?? []).some((l) => l.locationId === locationId),
    []
  )

  // Drop every selected location of the given types (and its `locationId` filter
  // entries) — used when a selectable overlay layer is hidden and its selection
  // must stop constraining the search. Re-commits the remainder through
  // `selectLocations`, so the filter stays in sync (empties fully when nothing
  // else is selected). No-op when nothing of that type is selected.
  const removeLocationsByType = useCallback(
    (types: ApiLocation['type'][]): void => {
      const current = ref.current.locations ?? []
      const next = current.filter((l) => !types.includes(l.type))
      if (next.length === current.length) return
      selectLocations(next)
    },
    [selectLocations]
  )

  return {
    selectLocations,
    clearSelection,
    clearLocationFilters,
    toggleLocation,
    patchLocation,
    locationSelected,
    removeLocationsByType
  }
}
