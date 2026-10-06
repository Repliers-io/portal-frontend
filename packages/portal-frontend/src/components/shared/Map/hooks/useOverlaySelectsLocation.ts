import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  type GeoJSONFeature,
  LngLatBounds,
  type Map as MapboxMap,
  type MapMouseEvent
} from 'mapbox-gl'

import type { OverlayLayerDefinition } from '@defaults/map'

import { type ApiLocation, type LocationDataSource } from 'services/API'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import {
  overlayPolygonId,
  setHoverFeatureState,
  setSelectedFeatureState,
  setSelectedMarker,
  setupHoverState
} from 'utils/map'
import { parseExternalLocationId } from 'utils/map/externalLocations'

import { useLocationSelection } from './useLocationSelection'
import { useMapListener } from './useMapListener'

/**
 * Find the `selectable` overlay that renders a given location type — maps a
 * location (e.g. one resolved from a saved `locationId`) back to the overlay that
 * draws/selects its linked polygon.
 */
export const overlayForLocation = (
  overlays: OverlayLayerDefinition[],
  type: ApiLocation['type'] | undefined
): OverlayLayerDefinition | undefined =>
  overlays.find(
    (o) => o.selectable && Boolean(type && o.locationTypes?.includes(type))
  )

/** The overlay's polygon GL source id. Polygons render data-driven, so any
 *  overlay may have one — existence is checked via `map.getSource` at the call
 *  site (and `setSelectedFeatureState`), not by the `polygon` config. */
const overlayPolygonSource = (
  overlay: OverlayLayerDefinition | undefined
): string | undefined => (overlay ? overlayPolygonId(overlay.id) : undefined)

/**
 * Single entry point for selection paint: reflect one location's `selected` state on
 * the map — its overlay's polygon (GL feature-state, when the source exists) and/or its
 * marker (`.lm.selected`, when the overlay opts in via `marker.selectedState`).
 * Idempotent; the source/marker guards make it a no-op until either is rendered.
 */
const reflectLocationSelected = (
  map: MapboxMap | null | undefined,
  overlays: OverlayLayerDefinition[],
  loc: { locationId: string; type: ApiLocation['type'] | undefined },
  selected: boolean
): void => {
  const overlay = overlayForLocation(overlays, loc.type)
  const source = overlayPolygonSource(overlay)
  if (source) setSelectedFeatureState(map, source, loc.locationId, selected)
  if (overlay?.marker?.selectedState) {
    setSelectedMarker(loc.locationId, selected)
  }
}

// Mapbox serializes array/object feature properties to JSON strings in click /
// queryRenderedFeatures results (GeoJSON sources), so a polygon-click bbox arrives
// as a string. Parse it back; marker-click bbox is already a real array.
const parseSerialized = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

/** Read a `[west, south, east, north]` bbox from marker/polygon properties. */
const boundsFromProperties = (bbox: unknown): LngLatBounds | undefined => {
  const arr = parseSerialized(bbox)
  if (!Array.isArray(arr) || arr.length !== 4) return undefined
  const [west, south, east, north] = arr.map(Number)
  if (![west, south, east, north].every(Number.isFinite)) return undefined
  return new LngLatBounds([west, south], [east, north])
}

/**
 * Reconstruct an `ApiLocation` from an overlay marker's feature properties.
 * Omits `map.boundary` (marker properties don't carry the geometry): the real
 * polygon is drawn by the overlay polygon layer, and its extent is carried as
 * `bounds` (from the `bbox` property) so the MapTitle recenter button frames the
 * polygon, not a circle.
 */
export const locationFromProperties = (
  properties: Record<string, unknown>
): ApiLocation | null => {
  const { locationId, name, type, address, source } = properties
  if (typeof locationId !== 'string' || typeof name !== 'string') return null

  const location: ApiLocation = {
    locationId,
    name,
    type: type as ApiLocation['type']
  }

  if (address && typeof address === 'object') {
    location.address = address as ApiLocation['address']
  }

  const longitude = Number(properties.longitude)
  const latitude = Number(properties.latitude)
  if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
    location.map = { latitude, longitude }
  }

  const bounds = boundsFromProperties(properties.bbox)
  if (bounds) location.bounds = bounds

  // Source is stamped onto the data at fetch time (APILocations) and flows through
  // the GeoJSON properties — carry it onto the reconstructed location.
  if (typeof source === 'string') location.source = source as LocationDataSource

  // External-source overlays stamp `external: true` in their fetchData — carry it
  // so the selection commits to the `externalLocationId` filter, not `locationId`.
  if (properties.external === true) location.external = true

  return location
}

/**
 * Toggle one overlay location in the shared selection. The single body behind both
 * entry points: the desktop marker click (`onMarkerClick`, injected below) and the
 * tooltip's own button on touch, where a tap only previews and never commits.
 * Returns false when the properties carry no resolvable location.
 */
export const useOverlayLocationToggle = (
  overlays: OverlayLayerDefinition[]
) => {
  const { mapRef } = useMapOptions()
  const { toggleLocation, locationSelected, patchLocation } =
    useLocationSelection()

  return useCallback(
    (
      overlay: OverlayLayerDefinition,
      properties: Record<string, unknown>
    ): boolean => {
      const location = locationFromProperties(properties)
      if (!location) return false
      const selectedNow = !locationSelected(location.locationId)
      // Paint polygon + marker first (cheap, instant feel) before the heavier
      // `toggleLocation` (selection state + listing refetch).
      reflectLocationSelected(mapRef.current, overlays, location, selectedNow)
      // Anti-flash: clear the polygon's `hover` so a freshly-selected polygon
      // doesn't show the deselect-red while the cursor is still on the marker
      // (resolvePolygonStyle 'polygon': `selected && hover` → red). Only a FRESH
      // hover (leave + return) should then mean "click again to remove".
      const source = overlayPolygonSource(overlay)
      if (source) {
        setHoverFeatureState(mapRef.current, source, location.locationId, false)
      }
      toggleLocation(location)
      // Native locations (no `external`) are complete on selection: they
      // constrain the search by `locationId` directly — no boundary needed,
      // listings fetch immediately (a point-only one like an MLS neighborhood
      // only needs an aggregate call for the map *recenter*, not to search).
      // An external location, by contrast, has no geometry yet (marker
      // properties don't carry it), so backfill via the overlay's resolver;
      // the listings fetch is gated until the boundary lands, and the patch
      // re-fires it through the `locations` dependency.
      if (selectedNow && location.external && overlay.external) {
        const parsed = parseExternalLocationId(location.locationId, [overlay])
        if (parsed) {
          overlay.external
            .resolveLocation(parsed.rest)
            .then((resolvedLoc) => {
              if (resolvedLoc) patchLocation(location.locationId, resolvedLoc)
            })
            .catch((error) =>
              console.error(
                `[externalLocation] resolve failed for ${location.locationId}:`,
                error
              )
            )
        }
      }
      return true
    },
    [overlays, toggleLocation, locationSelected, patchLocation, mapRef]
  )
}

/**
 * Main-search-map-only: injects an `onMarkerClick` into every overlay flagged
 * `selectable: 'marker'`. The click toggles the location in the shared selection
 * (`useLocationSelection`) and toggles the linked polygon's `selected`
 * feature-state. Kept out of the shared `useOverlayLayers` so the PDP map
 * never gains a `useSearch` dependency.
 */
export const useOverlaySelectsLocation = (
  overlays: OverlayLayerDefinition[]
): OverlayLayerDefinition[] => {
  const { mapRef } = useMapOptions()
  const { locations } = useMapLocations()
  const toggleOverlayLocation = useOverlayLocationToggle(overlays)
  // Used by the polygon-select path below, which paints and suppresses hover
  // differently from the marker path.
  const { toggleLocation, locationSelected } = useLocationSelection()

  // Remember the previous selection (id → type) so a removed location can be cleared
  // through `reflectLocationSelected` even after it's gone from `locations`.
  const prevRef = useRef<Map<string, ApiLocation['type']>>(new Map())

  const result = useMemo(
    () =>
      overlays.map((overlay) =>
        overlay.selectable === 'marker'
          ? {
              ...overlay,
              onMarkerClick: (properties: Record<string, unknown>): boolean =>
                toggleOverlayLocation(overlay, properties)
            }
          : overlay
      ),
    [overlays, toggleOverlayLocation]
  )

  // Sync selection to the current `locations`: clear removed, (re)apply current — all
  // through `reflectLocationSelected`. The re-apply matters because a URL `locationId`
  // can resolve AFTER the overlay rendered its markers, and the idle re-stamp never
  // fires for marker-only overlays (no GL source to trigger 'idle'). The opposite order
  // (selection first) is covered by the born-selected stamp in renderOverlayMarkers.
  useEffect(() => {
    const current = locations ?? []
    const currentIds = new Set(current.map((l) => l.locationId))
    prevRef.current.forEach((type, id) => {
      if (currentIds.has(id)) return
      reflectLocationSelected(
        mapRef.current,
        overlays,
        { locationId: id, type },
        false
      )
    })
    current.forEach((loc) =>
      reflectLocationSelected(mapRef.current, overlays, loc, true)
    )
    prevRef.current = new Map(current.map((l) => [l.locationId, l.type]))
  }, [locations, overlays, mapRef])

  // Restore `selected` feature-state for the current selection. A click paints it
  // directly, but a `locationId` loaded from the URL has no click — and the
  // overlay's polygon source may load AFTER the selection is set. Re-applying on
  // `idle` lands it once the source has loaded/re-tiled; the source promotes
  // `locationId`, so setting by id persists. Reads through refs so the listener
  // stays attached once (map lifetime) yet always sees the latest selection.
  const locationsRef = useRef(locations)
  locationsRef.current = locations
  const overlaysRef = useRef(overlays)
  overlaysRef.current = overlays

  useMapListener(mapRef, (map) => {
    const apply = () =>
      (locationsRef.current ?? []).forEach((loc) =>
        reflectLocationSelected(map, overlaysRef.current, loc, true)
      )
    apply()
    map.on('idle', apply)
  })

  // Polygon-select overlays (`selectable: 'polygon'`): hovering reveals the polygon
  // and clicking it toggles the location — the overlay-flag replacement for the
  // removed legacy location-highlights mode. Attached once per map; the GL fill layer may
  // not exist yet (overlay inactive), which Mapbox tolerates for layer-scoped
  // events — they start firing once the layer is added.
  useMapListener(mapRef, (map) => {
    overlaysRef.current
      .filter((o) => o.selectable === 'polygon')
      .forEach((o) => {
        const source = overlayPolygonId(o.id)
        const fillId = `${source}-fill`
        const { suppress } = setupHoverState(map, source, fillId)
        map.on(
          'click',
          fillId,
          (e: MapMouseEvent & { features?: GeoJSONFeature[] }) => {
            const location = locationFromProperties(
              e.features?.[0]?.properties ?? {}
            )
            if (!location) return
            // Paint first, then SUPPRESS hover: the cursor is still inside the
            // polygon, so a plain clear would re-hover on the next mousemove and
            // flash the deselect-red. `suppress` keeps it un-hovered until the
            // cursor leaves and returns — a genuinely fresh hover.
            const selectedNow = !locationSelected(location.locationId)
            reflectLocationSelected(
              map,
              overlaysRef.current,
              location,
              selectedNow
            )
            suppress()
            toggleLocation(location)
          }
        )
      })
  })

  return result
}
