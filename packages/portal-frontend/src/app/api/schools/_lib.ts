import {
  type Feature,
  type Geometry,
  type MultiPolygon,
  type Point,
  type Polygon
} from 'geojson'

import { booleanPointInPolygon } from '@turf/turf'

import {
  type Bbox,
  matchesFilters,
  regularBoundary,
  type SchoolCached,
  type SchoolFilters,
  standardCatchment
} from 'services/MoveSmartly'

export type { SchoolFilters }
export { matchesFilters }

export const asPolygonFeature = (
  geometry: Geometry | null
): Feature<Polygon | MultiPolygon> | null => {
  if (!geometry) return null
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')
    return null
  return { type: 'Feature', geometry, properties: {} }
}

// Determines whether a boundary contains the given point.
// Uses standardCatchment (excludes French zones) so board-wide French zones
// do not incorrectly match the listing location.
export const boundaryContainsPoint = (
  b: Parameters<typeof standardCatchment>[0],
  pt: Feature<Point>
): boolean => {
  if (!standardCatchment(b)) return false
  const feature = asPolygonFeature(b.boundary)
  return feature ? booleanPointInPolygon(pt, feature) : false
}

// ── Numeric parsing ────────────────────────────────────────────────

export const finiteInRange = (
  v: unknown,
  min: number,
  max: number
): v is number => typeof v === 'number' && isFinite(v) && v >= min && v <= max

export const parseFiniteInRange = (
  raw: string | null,
  min: number,
  max: number
): number | null => {
  if (raw === null) return null
  const n = Number(raw)
  return finiteInRange(n, min, max) ? n : null
}

// ── Boundaries flag ────────────────────────────────────────────────
// Explicit `boundaries=true` / `boundaries=false` overrides any caller default
// (e.g. zoom threshold on the list route). When absent, returns null so the
// caller can apply its own default.

export const parseFilters = (params: URLSearchParams): SchoolFilters => ({
  elementary: params.get('elementary') !== 'false',
  secondary: params.get('secondary') !== 'false',
  public: params.get('public') !== 'false',
  catholic: params.get('catholic') !== 'false',
  french: params.get('french') !== 'false'
})

export const parseBoundariesFlag = (
  params: URLSearchParams
): boolean | null => {
  const raw = params.get('boundaries')
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

// ── Response shape ─────────────────────────────────────────────────
// Bboxes are pre-computed at cache time (englishBbox / frenchBbox, split by
// boundary language) and passed through as objects; the client flattens the
// language-appropriate one to swLng/… scalars for fitBounds.
export const serialiseSchool = (
  school: SchoolCached,
  includeBoundaries: boolean,
  pt?: Feature<Point>
) => {
  const { englishBbox, frenchBbox, id, ...rest } = school
  const boundaries = includeBoundaries
    ? (rest.boundaries?.filter(regularBoundary).map((b) => ({
        ...b,
        matched: pt != null ? boundaryContainsPoint(b, pt) : false
      })) ?? null)
    : null
  // Both bboxes go to the client, which picks the one matching the active
  // language filter (and centres the school when its language has no catchment).
  return {
    ...rest,
    id: String(id),
    boundaries,
    englishBbox,
    frenchBbox
  }
}

// ── Bbox intersection ──────────────────────────────────────────────

export const bboxIntersects = (a: Bbox, b: Bbox): boolean =>
  a.swLat <= b.neLat &&
  a.neLat >= b.swLat &&
  a.swLng <= b.neLng &&
  a.neLng >= b.swLng
