import type { FeatureCollection } from 'geojson'
import type { LngLatBounds } from 'mapbox-gl'
import queryString from 'query-string'

import { info } from '@configs/colors'
import mapConfig from '@configs/map'
import {
  type OverlayLayerDefinition,
  type OverlaySurfaceVisibility
} from '@defaults/map'

import type { Category } from 'app/api/mapbox/pois/_lib'

import type { LocationType } from 'services/API'
import { locationsToGeoJson } from 'services/API/locationsToGeoJson'

import { lighten } from '@mui/material/styles'

import { boundsToCenterRadius, toRectangle } from './converters'

/** The overlay with this id, or undefined. Replaces the repeated inline find. */
export const overlayById = (id: string): OverlayLayerDefinition | undefined =>
  mapConfig.overlays.layers.find((l) => l.id === id)

const activeByDefault = (
  value: OverlaySurfaceVisibility | undefined
): boolean => typeof value === 'object' && value.active === true

/**
 * Ids of overlays that start ENABLED on a given map surface. Default-active is
 * explicit opt-in: only `showOn[surface] = { active: true }` seeds a layer into
 * the initial `activeLayers` set. Stubs never seed.
 */
export const defaultActiveLayerIds = (
  layers: OverlayLayerDefinition[],
  surface: 'search' | 'listing'
): string[] =>
  layers
    .filter((l) => !l.stub && activeByDefault(l.showOn?.[surface]))
    .map((l) => l.id)

/** A layer's option state as its fetchData/filterToken consumers see it:
 *  config `filterOptions` defaults overlaid with the user's toggles. */
export const overlayEffectiveOptions = (
  overlay: Pick<OverlayLayerDefinition, 'id' | 'filterOptions'>,
  layerOptions: Record<string, Record<string, boolean>>
): Record<string, boolean> => ({
  ...Object.fromEntries(
    (overlay.filterOptions ?? []).map((o) => [o.key, o.defaultValue])
  ),
  ...layerOptions[overlay.id]
})

export const overlayLayerId = (id: string) => `${id}-markers`
// Polygon source + base layer id (fill = `${base}-fill`, outline = `${base}-outline`).
// Distinct from the marker layer so marker-linked overlays carry both ids.
export const overlayPolygonId = (id: string) => `${id}-polygons`

// DOM id for an overlay point marker's `.lm` element, keyed by the location it
// renders. Lets the MapTitle location chip light the matching marker's ring
// (`.lm.active`) on hover — the overlay-side analogue of listings' `getMarkerName`.
export const overlayMarkerDomId = (locationId: string) =>
  `overlay-marker-${locationId}`

// Toggle an overlay marker's selected visual (`.lm.selected`) by location id — the
// marker analogue of a polygon's `selected` feature-state, enabled per overlay via
// `marker.selectedState`. No-op if the marker isn't currently rendered.
export const setSelectedMarker = (
  locationId: string,
  selected: boolean
): void => {
  document
    .getElementById(overlayMarkerDomId(locationId))
    ?.classList.toggle('selected', selected)
}

// The uniform property that links an overlay's markers to their polygons: plain
// `id`, which the GeoJSON converters put on every feature — so configs only flip
// `showOnMarkerHover` on (never naming a property). Undefined when the overlay has no link.
export const overlayLinkId = 'id'
export const markerLinkId = (polygon?: {
  showOnMarkerHover?: boolean
}): string | undefined =>
  polygon?.showOnMarkerHover ? overlayLinkId : undefined

// One marker point per polygon, at the centre its location carries
const withCenterPoints = (data: FeatureCollection): FeatureCollection => ({
  ...data,
  features: data.features.flatMap((feature) => {
    const { longitude, latitude } = feature.properties ?? {}
    return feature.geometry.type === 'Point' ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude)
      ? [feature]
      : [
          feature,
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [longitude, latitude]
            },
            properties: feature.properties
          }
        ]
  })
})

/**
 * A touch map can't hover a polygon, and the mouse events a tap emulates reach the
 * polygon layers through any marker above them. So there every polygon-select overlay
 * selects through name markers at its polygons' centres instead, as the neighborhoods
 * do: a tap previews the boundary, the tooltip's button selects, and the polygons keep
 * no hover or click of their own.
 */
export const toMarkerSelect = (
  overlay: OverlayLayerDefinition
): OverlayLayerDefinition =>
  overlay.selectable === 'polygon'
    ? {
        ...overlay,
        selectable: 'marker',
        marker: overlay.marker ?? { type: 'name' },
        // the neighborhoods' name-marker clustering (configs/defaults/overlays/liveBy.ts)
        cluster: overlay.cluster ?? { radius: 60, maxZoom: 13, minPoints: 2 },
        polygon: { ...overlay.polygon, showOnMarkerHover: true },
        fetchData: async (...args) =>
          withCenterPoints(await overlay.fetchData(...args))
      }
    : overlay

/** The overlay's main colour — defaults to the palette `info` colour (also when
 *  the overlay is missing). Single source of truth: callers never hardcode a
 *  fallback hex that would drift from the config. */
export const overlayAccent = (overlay?: { color?: string }): string =>
  overlay?.color ?? info

/**
 * The overlay's colour by id — `overlayAccent` over the looked-up overlay (its
 * `color`, else the palette `info`). Tooltip cards use this instead of repeating
 * the find and hardcoding a fallback that would drift from the config.
 */
export const overlayColor = (id: string): string =>
  overlayAccent(overlayById(id))

/**
 * The overlay's polygon colour: the explicit `polygon.color` override when set,
 * otherwise the overlay's main colour (which itself defaults to `info`).
 */
export const overlayPolygonColor = (overlay: {
  color?: string
  polygon?: { color?: string }
}): string => overlay.polygon?.color ?? overlayAccent(overlay)

/**
 * Derive a polygon's fill/line colours from a single main colour. Same scheme as
 * location polygons (both lightened by 0.3), so locations and overlays compute
 * colours identically — each layer supplies only its main colour.
 */
export const createPolygonColors = (color: string) => ({
  'fill-color': lighten(color, 0.3),
  'line-color': lighten(color, 0.3)
})

type FetchArgs = {
  bounds: LngLatBounds
  categories: Category[]
  proximity?: [number, number]
  limit?: number
  signal: AbortSignal
}

const poisToBboxParam = (bounds: LngLatBounds): string => {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
}

export const fetchPois = async ({
  bounds,
  categories,
  proximity,
  limit,
  signal
}: FetchArgs): Promise<FeatureCollection> => {
  const params = queryString.stringify({
    categories: categories.join(','),
    bbox: poisToBboxParam(bounds),
    proximity: proximity ? `${proximity[0]},${proximity[1]}` : undefined,
    limit
  })

  const response = await fetch(`/api/mapbox/pois?${params}`, { signal })
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`)
  return (await response.json()) as FeatureCollection
}

export const locationFields =
  'locationId,name,type,subType,address,map,school,size'

type OverlayLocationsParams = {
  type: LocationType | LocationType[]
  source: string
  markers?: boolean
  // Restrict results to locations that HAVE a boundary polygon. Defaults to true
  // (LiveBy overlays need polygons); set false for point-only sources whose
  // locations carry no boundary (e.g. MLS neighborhood centroids).
  boundaryOnly?: boolean
}

/**
 * Fetch helper for the Repliers `/locations` source (LiveBy overlays) — the
 * per-source equivalent of `fetchPois`. Resolves the viewport to center+radius,
 * queries `APILocations` and converts the result to GeoJSON. `APILocations` is
 * pulled in via a dynamic `import()` so it stays out of the `@configs/map` static
 * module graph, which would otherwise form a load-time dependency cycle
 * (@configs/map → overlays → APILocations → utils/map → @configs/map).
 */
export const fetchLocations = async (
  bounds: LngLatBounds,
  signal: AbortSignal,
  { type, source, markers, boundaryOnly }: OverlayLocationsParams
): Promise<FeatureCollection> => {
  const { APILocations } = await import('services/API/APILocations')
  const response = await APILocations.fetch(
    {
      source,
      type,
      ...boundsToCenterRadius(bounds),
      // Omit the API param entirely when not restricting: sending hasBoundary=false
      // would ask the API for boundary-LESS locations only, not "any".
      ...((boundaryOnly ?? true) ? { hasBoundary: true } : {}),
      fields: locationFields
    },
    { signal }
  )
  // `APILocations.fetch` swallows every failure into `null`, an abort included. Left
  // alone, a pan would look like an empty result: the caller would store it, publish
  // it, and — its sync key already written — never re-fetch this viewport. Throwing
  // hands it to the caller's existing AbortError branch, which publishes nothing.
  signal.throwIfAborted()

  return locationsToGeoJson(response?.locations ?? [], { markers })
}

/**
 * Overlay fetch that keeps only populated locations — the declarative sibling of
 * `fetchLocations` for sources with dirty empties (MLS `/locations` returns many
 * empty neighborhoods, often same-name duplicates under different parent cities).
 * Routes through `/api/overlay-locations`, which re-fetches server-side and keeps
 * only locations present in the static locations-cache allowlist (kept
 * server-side, off the client). Surviving locations keep their native
 * `locationId`, so selection is identical to `fetchLocations` — an overlay opts
 * in purely by pointing its `fetchData` here instead.
 */
export const fetchDedupedLocations = async (
  bounds: LngLatBounds,
  signal: AbortSignal,
  { type, source, markers, boundaryOnly }: OverlayLocationsParams
): Promise<FeatureCollection> => {
  const { lat, long, radius } = boundsToCenterRadius(bounds)
  const query = queryString.stringify({
    type,
    source,
    lat,
    long,
    radius,
    markers,
    boundaryOnly
  })
  const response = await fetch(`/api/overlay-locations?${query}`, { signal })
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`)
  return (await response.json()) as FeatureCollection
}

/**
 * Viewport parcels through `/api/public-record`, which pages the upstream and
 * drops the duplicate rows it returns before anything reaches the client. Doing it
 * here meant ten round-trips and megabytes of JSON parsed on the main thread for a
 * dense viewport; the route answers once, already deduplicated and trimmed.
 */
const requestParcels = async (
  bounds: LngLatBounds,
  signal: AbortSignal,
  publicRecord?: boolean
): Promise<FeatureCollection> => {
  const query = queryString.stringify({
    map: toRectangle(bounds),
    publicRecord: publicRecord ? 1 : undefined
  })
  const response = await fetch(`/api/public-record?${query}`, { signal })
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`)
  return (await response.json()) as FeatureCollection
}

export const fetchParcels = (bounds: LngLatBounds, signal: AbortSignal) =>
  requestParcels(bounds, signal)

/**
 * Parcels carrying their assessor record (APN, county FIPS, and the lot/building
 * fields the dataset fills in). A separate entry point rather than a flag on
 * `fetchParcels`, because that one IS the overlay's `fetchData` — the viewport layer
 * cannot reach the record even by accident.
 */
export const fetchParcelsWithRecord = (
  bounds: LngLatBounds,
  signal: AbortSignal
) => requestParcels(bounds, signal, true)
