import type { Feature, FeatureCollection, Position } from 'geojson'

import type { ApiLocation } from 'services/API'

/**
 * Accepts the `map=` polygon only if it parses as a ring of coordinate pairs — the
 * same shape `/api/schools` and `/api/parcel` take. The value is forwarded to the
 * upstream query untouched, so this is a shape check, not a parser: we never build a
 * URL path from it.
 */
export const validMapPolygon = (raw: string | null): string | null => {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  const ring = parsed[0]
  if (!Array.isArray(ring) || ring.length < 3) return null
  const pairs = ring.every(
    (point) =>
      Array.isArray(point) &&
      point.length === 2 &&
      point.every(
        (value) => typeof value === 'number' && Number.isFinite(value)
      )
  )
  return pairs ? raw : null
}

/**
 * Keeps the first copy of each `locationId`.
 *
 * The upstream pages overlap: `/locations` has no stable sort to page against, so a
 * parcel can be served on two adjacent pages while another is skipped. Measured at
 * roughly 11% of rows over a ten-page sweep of downtown Austin.
 */
export const dedupeLocations = (pages: (ApiLocation[] | undefined)[]) => {
  const byId = new Map<string, ApiLocation>()
  pages.forEach((locations) =>
    locations?.forEach((location) => {
      if (!byId.has(location.locationId))
        byId.set(location.locationId, location)
    })
  )
  return Array.from(byId.values())
}

// Sorts after every numbered address on the same street.
const unnumbered = Number.MAX_SAFE_INTEGER

// Assessor addresses lead with the house number ("120 W 5TH ST"), so the street is
// whatever follows it. A name without one stays whole and counts as a street.
const addressParts = (name: unknown) => {
  const value = typeof name === 'string' ? name.trim() : ''
  const [head, ...rest] = value.split(/\s+/)
  const number = parseInt(head, 10)
  return rest.length && Number.isFinite(number)
    ? { street: rest.join(' '), number }
    : { street: value, number: unnumbered }
}

/**
 * Street, then house number.
 *
 * The upstream pages in no order at all (see `dedupeLocations`), so a viewport
 * arrives shuffled and two neighbours in the array are unrelated on the ground.
 * Sorting here gives every consumer one order — the parcel dialog steps through it
 * with its arrows. Numbers compare as numbers, so 9 precedes 120; a parcel with no
 * address sorts last.
 */
export const byAddress = (first: Feature, second: Feature): number => {
  const a = addressParts(first.properties?.name)
  const b = addressParts(second.properties?.name)
  if (!a.street) return b.street ? 1 : 0
  if (!b.street) return -1
  return a.street.localeCompare(b.street) || a.number - b.number
}

// Six decimals is roughly 11 cm — finer than a parcel boundary is surveyed and far
// finer than anything visible at the zooms this layer renders at. Measured saving on
// a downtown viewport: 3.33 MB raw / 0.22 MB gzipped down to 3.16 / 0.20.
const precision = 1e6

const roundPosition = (position: Position): Position =>
  position.map((value) => Math.round(value * precision) / precision)

const roundCoordinates = (value: unknown): unknown =>
  Array.isArray(value) && typeof value[0] === 'number'
    ? roundPosition(value as Position)
    : Array.isArray(value)
      ? value.map(roundCoordinates)
      : value

/**
 * One feature per footprint, carrying every street address its stack answered to.
 *
 * A condo tower registers each unit as its own assessor parcel over the same
 * outline. One downtown viewport held 7910 records across 1265 distinct footprints,
 * 21 of them on a single building — and they draw identically, so 6 in every 7 were
 * pure weight: 4698 KB against 756 KB.
 *
 * The names are merged rather than reduced to the first, because a tower with two
 * frontages answers to both (`200 CONGRESS AVE` and `210 LAVACA ST` share one
 * outline) and the address match needs either to resolve a mispinned listing.
 *
 * Every address is kept, however many a footprint carries. The upstream also hands
 * one placeholder outline to records that have nothing to do with it — a single
 * downtown footprint came back with 6546 records and 1047 addresses over 42
 * postcodes — and nothing here can tell which of them the outline truly belongs to.
 * Keeping them all costs about 20 KB and lets the address match decide; a listing
 * whose pin is nowhere near the outline is refused by the rescue's distance guard.
 */
export const collapseByFootprint = (
  collection: FeatureCollection
): FeatureCollection => {
  const kept = new Map<string, Feature>()
  const names = new Map<string, Set<string>>()

  collection.features.forEach((feature) => {
    const footprint = JSON.stringify(feature.geometry)
    if (!kept.has(footprint)) kept.set(footprint, feature)
    const name = feature.properties?.name
    if (typeof name !== 'string' || !name) return
    const stack = names.get(footprint)
    if (stack) stack.add(name)
    else names.set(footprint, new Set([name]))
  })

  return {
    ...collection,
    features: Array.from(kept, ([footprint, feature]) => {
      const stack = names.get(footprint)
      return stack && stack.size > 1
        ? {
            ...feature,
            properties: { ...feature.properties, names: Array.from(stack) }
          }
        : feature
    })
  }
}

/**
 * Properties the parcels path actually reads. `locationsToGeoJson` spreads every
 * field a location carries — address, bbox, size, source, subType, type — which
 * measured 5.17 MB against 3.2 MB for this set on one downtown viewport. Everything
 * kept here has a reader:
 *   id                  grouping, the colour match expression, the hover lookup
 *   locationId          the built-in polygon-hover dedupe key
 *   name                the popup's accessible name
 *   names               the other addresses of a collapsed stack, when it had more
 *   longitude/latitude  the popup anchor
 */
const keptProperties = [
  'id',
  'locationId',
  'name',
  'names',
  'longitude',
  'latitude'
]

// A nested record (the assessor's `publicRecord`) holds one column per field the
// dataset COULD carry, and the county fills a different subset — the rest arrive as
// null and outweigh the answers. Arrays (`names`) keep their shape.
const withoutEmpty = (value: unknown) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return value
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== null && field !== '')
  )
}

const trimProperties = (properties: Feature['properties'], keep: string[]) => {
  if (!properties) return properties
  return Object.fromEntries(
    keep
      .filter((key) => properties[key] !== undefined)
      .map((key) => [key, withoutEmpty(properties[key])])
  )
}

/**
 * Rounds coordinates and drops properties nothing downstream reads. `extra` adds
 * to the kept set for a caller that needs more — the listing page asks for the
 * assessor record, which is 142 fields the viewport layer must never carry.
 */
export const compactCollection = (
  collection: FeatureCollection,
  extra: string[] = []
): FeatureCollection => ({
  ...collection,
  features: collection.features.map((feature) => ({
    ...feature,
    properties: trimProperties(feature.properties, [
      ...keptProperties,
      ...extra
    ]),
    geometry:
      'coordinates' in feature.geometry
        ? {
            ...feature.geometry,
            coordinates: roundCoordinates(feature.geometry.coordinates)
          }
        : feature.geometry
  })) as FeatureCollection['features']
})
