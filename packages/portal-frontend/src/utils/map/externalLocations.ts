import { type ApiLocation } from 'services/API'

/**
 * External overlay location ids serialize as `<overlayId>-<rest>` in the
 * `externalLocationId` URL param / filter. `rest` is opaque here — the owning
 * overlay's `external` config builds and parses it (see OverlayExternalLocations).
 */
export const buildExternalLocationId = (
  overlayId: string,
  rest: string
): string => `${overlayId}-${rest}`

/**
 * Split an external id back into the owning overlay and its opaque rest.
 * Overlay ids may contain dashes (`condo-development`), so the longest
 * configured id wins. Only overlays that declare `external` support qualify.
 */
export const parseExternalLocationId = (
  id: string,
  overlays: Array<{ id: string; external?: unknown }>
): { overlayId: string; rest: string } | null => {
  const overlay = overlays
    .filter((o) => o.external && id.startsWith(`${o.id}-`))
    .sort((a, b) => b.id.length - a.id.length)[0]
  if (!overlay) return null
  const rest = id.slice(overlay.id.length + 1)
  return rest ? { overlayId: overlay.id, rest } : null
}

/**
 * Keep only external ids a configured `external` overlay can own. An id whose
 * overlay this tenant doesn't have (e.g. a `schools-…` id opened on a tenant
 * without the schools overlay) can never resolve a boundary, so leaving it in the
 * `externalLocationId` filter would block every listing fetch forever
 * (`unresolvedExternalIds` waits on it). Dropping it at the input boundary lets the
 * search fall through to its normal, unconstrained result.
 */
export const resolvableExternalIds = (
  ids: string[],
  overlays: Array<{ id: string; external?: unknown }>
): string[] =>
  ids.filter((id) => parseExternalLocationId(id, overlays) !== null)

/** Selection → filter values: native ids go to `locationId`, external ids
 *  (locations flagged `external`) to `externalLocationId`. */
export const splitSelectionIds = (
  locations: ApiLocation[]
): { locationId: string[]; externalLocationId: string[] } => ({
  locationId: locations.filter((l) => !l.external).map((l) => l.locationId),
  externalLocationId: locations
    .filter((l) => l.external)
    .map((l) => l.locationId)
})
