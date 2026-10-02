import { cache } from 'react'
import type { Feature, FeatureCollection } from 'geojson'

import { logError } from 'utils/log'
import { titleCase } from 'utils/strings'

import { MoveSmartlyAPI } from './MoveSmartlyAPI'
import type {
  CommuteMode,
  ListingEnrichedData,
  School,
  SchoolBoundary,
  SchoolCached,
  SchoolFilters,
  SchoolResponse,
  SchoolTypeFilters
} from './types'

// Specialty-intake zones — board-wide program admission areas, not
// neighbourhood catchments. In the wire data they carry grade flags too (an AP
// zone still has isHigh: true), so grade level alone cannot identify them.
const specialtyIntake = (b: SchoolBoundary): boolean =>
  b.isAP || b.isIB || b.isGifted || b.isArts || b.isSport

// Grade-level boundaries — excludes specialty-intake programs (Arts, AP, IB,
// Gifted, Sport) but keeps French Immersion / Extended French so their
// catchment polygons are returned to the client and rendered on the map.
export const regularBoundary = (b: SchoolBoundary): boolean =>
  (b.isElementary || b.isMiddle || b.isHigh) && !specialtyIntake(b)

// Standard neighbourhood catchments — regular boundaries minus French-program
// zones. Used for point-in-polygon matching only: French zones are board-wide
// and do not indicate that a listing is "in" a French school's catchment.
export const standardCatchment = (b: SchoolBoundary): boolean =>
  regularBoundary(b) && !b.isFrenchImmersion && !b.isExtendedFrench

async function isolatedFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    logError('[MoveSmartly] enrichment fetch failed:', error)
    return null
  }
}

/**
 * Fetches all MoveSmartly enrichment data for a listing in parallel.
 *
 * Designed to be called server-side (RSC / route handler).
 * Uses React `cache()` to deduplicate within a single request.
 *
 * Individual endpoint failures are isolated — the aggregated result
 * will contain empty arrays / null for any section that fails,
 * without blocking the rest.
 */
export const fetchListingEnrichedData = cache(
  async (mlsNumber: string): Promise<ListingEnrichedData> => {
    const listing = await isolatedFetch(() =>
      MoveSmartlyAPI.fetchListing(mlsNumber)
    )
    return {
      listing: listing ?? {
        insights: [],
        buildingPermits: { permits: [], message: null }
      }
    }
  }
)

// Server-side school filter for the main map. Grade gates (elementary/secondary)
// plus an EXCLUSIVE French language switch:
//   french ON  → only French-main-language schools
//   french OFF → only English-language schools
// Board toggles (public/catholic) apply in BOTH modes.
export const matchesFilters = (
  s: Pick<
    SchoolCached,
    'isElementary' | 'isHigh' | 'isPublic' | 'isCatholic' | 'isEnglish'
  >,
  filters: SchoolFilters
): boolean => {
  if (!filters.elementary && s.isElementary) return false
  if (!filters.secondary && s.isHigh) return false
  // Language switch — exclude the side that doesn't match the French toggle.
  if (filters.french ? s.isEnglish : !s.isEnglish) return false
  if (!filters.public && s.isPublic) return false
  if (!filters.catholic && s.isCatholic) return false
  return true
}

// School matches the active board/language toggles. OR semantics — a school is
// shown when ANY enabled type matches. "French" is program-based (immersion /
// extended French), mirroring the PDP neighborhood sidebar exactly.
export const matchesSchoolTypes = (
  s: Pick<
    School,
    'isPublic' | 'isCatholic' | 'isFrenchImmersion' | 'isExtendedFrench'
  >,
  filters: SchoolTypeFilters
): boolean =>
  (filters.public && s.isPublic) ||
  (filters.catholic && s.isCatholic) ||
  (filters.french && (s.isFrenchImmersion || s.isExtendedFrench))

/** True when a boundary's language matches the active filter mode.
 * English mode (french=false) → boundary must be English.
 * French mode (french=true) → boundary must be French (non-English). */
export const boundaryMatchesLanguage = (
  isEnglish: boolean,
  french: boolean
): boolean => isEnglish === !french

/** Filter a school FeatureCollection to the polygons that match the active
 * language mode, keeping all Point (marker) features untouched. */
export const filterSchoolsGeoJson = (
  fc: FeatureCollection,
  french: boolean
): FeatureCollection => ({
  ...fc,
  features: fc.features.filter(
    (f) =>
      f.geometry.type === 'Point' ||
      boundaryMatchesLanguage(f.properties?.isEnglish as boolean, french)
  )
})

export const schoolsToGeoJson = (
  schools: SchoolResponse[],
  french: boolean,
  walkTimes?: Record<
    string,
    {
      loading?: boolean
      duration?: number | null
      mode?: CommuteMode
    }
  >
): FeatureCollection => {
  const pointFeatures: Feature[] = schools.map((s) => {
    const { boundaries: _, englishBbox, frenchBbox, ...properties } = s
    // Pick the bbox for the active language filter; flattened to scalars so it
    // survives Mapbox property serialisation. Absent → selectable centres the
    // school instead of zooming to the other language's catchment.
    const bbox = (french ? frenchBbox : englishBbox) ?? undefined
    const walkEntry = walkTimes?.[s.id]
    const commuteMinutes =
      walkEntry && !walkEntry.loading ? walkEntry.duration : undefined
    const commuteMode =
      walkEntry && !walkEntry.loading ? walkEntry.mode : undefined
    // Mapbox JSON-serializes all GeoJSON feature properties when passing them
    // through event handlers (e.features[0].properties). Nested arrays like
    // Position[] become a JSON string, requiring JSON.parse at every callsite.
    // Storing the bbox as 4 scalar numbers avoids the problem entirely — scalars
    // survive serialization unchanged and let the consumer reconstruct
    // LngLatBounds with a single `new LngLatBounds([sw], [ne])` call.
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
      properties: {
        ...properties,
        // School endpoint returns names in ALL CAPS — title-case for display.
        name: titleCase(s.name),
        address: titleCase(s.address),
        commuteMinutes,
        commuteMode,
        // `id` (from ...properties) is the marker↔polygon link key — the catchment
        // polygons below carry the same `id`, so configs only flip `showOnMarkerHover` on.
        ...(bbox ?? {})
      }
    }
  })

  const polygonFeatures: Feature[] = schools.flatMap(
    ({ id, name, boundaries, catchment }) =>
      (boundaries ?? [])
        .filter((b) => b.boundary != null && regularBoundary(b))
        // An in-catchment school is listed because the point falls inside a
        // specific level's polygon; its other levels cover a different area and
        // would read as catchments the listing is not in. Where no point match
        // was attempted (`catchment` absent — the main map), keep every polygon.
        .filter((b) => !catchment || b.matched)
        .map((b) => ({
          type: 'Feature' as const,
          geometry: b.boundary!,
          properties: {
            name: titleCase(name),
            // Same `id` the school point carries (see `markerLinkId`) — a school may
            // have several catchments, all sharing its id.
            id,
            matched: b.matched,
            isEnglish: b.isEnglish
          }
        }))
  )

  return {
    type: 'FeatureCollection',
    features: [...pointFeatures, ...polygonFeatures]
  }
}
