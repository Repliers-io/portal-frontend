import type { Position } from 'geojson'

import type { ApiLocation } from 'services/API'
import { buildExternalLocationId } from 'utils/map/externalLocations'
import { titleCase } from 'utils/strings'

import type { School } from './types'
import { boundaryMatchesLanguage, regularBoundary } from './utils'

/**
 * External-location plumbing for the schools overlay (`externalLocationId`
 * format: `schools-<schoolId>-<filterToken>`). The token captures the layer's
 * effective filter options at selection time — enough to rebuild the same
 * polygon set on reload (language picks the boundary side) and to detect
 * filter drift (reset-on-change invariant).
 */

// Token key order is fixed and versioned by position: e.g. 'e1s1p1c1f0'.
const tokenKeys = [
  'elementary',
  'secondary',
  'public',
  'catholic',
  'french'
] as const

export const schoolFilterToken = (options: Record<string, boolean>): string =>
  tokenKeys.map((key) => `${key[0]}${options[key] ? 1 : 0}`).join('')

export const parseSchoolRest = (
  rest: string
): { id: string; french: boolean } | null => {
  const match = /^(\d{1,10})-[a-z0-9]*f([01])[a-z0-9]*$/.exec(rest)
  return match ? { id: match[1], french: match[2] === '1' } : null
}

/**
 * Merge a school's catchments into one MultiPolygon coordinate set — regular
 * (grade-level) boundaries of the active language side, the same set the map
 * renders for the school. Specialty-intake zones (Arts/AP/IB/…) are excluded
 * by `regularBoundary`.
 */
export const mergeSchoolBoundaries = (
  school: Pick<School, 'boundaries'>,
  french: boolean
): Position[][][] =>
  (school.boundaries ?? [])
    .filter(
      (b) =>
        b.boundary != null &&
        regularBoundary(b) &&
        boundaryMatchesLanguage(b.isEnglish, french)
    )
    .flatMap(({ boundary }) => {
      if (boundary!.type === 'Polygon') {
        return [boundary!.coordinates as Position[][]]
      }
      if (boundary!.type === 'MultiPolygon') {
        return boundary!.coordinates as Position[][][]
      }
      return []
    })

const resolved = new Map<string, ApiLocation>()

/** Resolve `<schoolId>-<token>` to a selectable location via the tenant proxy
 *  (`/api/schools/{id}`). Cached per id+token for the session. */
export const resolveSchoolLocation = async (
  rest: string
): Promise<ApiLocation | null> => {
  const parsed = parseSchoolRest(rest)
  if (!parsed) return null

  const cached = resolved.get(rest)
  if (cached) return cached

  const response = await fetch(`/api/schools/${parsed.id}`)
  if (!response.ok) return null
  const school = (await response.json()) as School

  const boundary = mergeSchoolBoundaries(school, parsed.french)
  if (!boundary.length) return null

  // Dynamic import keeps this module out of the `@configs/map` static graph:
  // the schools overlay config references this resolver while
  // `utils/map/bounds` reads the map config at module level — a load-time
  // cycle (TDZ crash), same one `fetchLocations` dodges for APILocations.
  const { getBoundaryBounds } = await import('utils/map/bounds')

  const location: ApiLocation = {
    locationId: buildExternalLocationId('schools', rest),
    name: titleCase(school.name ?? ''),
    type: 'school',
    external: true,
    map: {
      latitude: school.latitude,
      longitude: school.longitude,
      boundary
    },
    bounds: getBoundaryBounds(boundary)
  }
  resolved.set(rest, location)
  return location
}
