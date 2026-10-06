import { type NextRequest, NextResponse } from 'next/server'

import { distance as turfDistance, point as turfPoint } from '@turf/turf'

import { MoveSmartlyAPI, type SchoolCached } from 'services/MoveSmartly'

import { assertSameOrigin } from '../../_lib'
import {
  parseBoundariesFlag,
  parseFiniteInRange,
  serialiseSchool
} from '../_lib'

// Point-in-bbox is the O(1) prefilter before running turf's polygon test.
const pointInBbox = (
  lng: number,
  lat: number,
  b: NonNullable<SchoolCached['englishBbox']>
): boolean =>
  lng >= b.swLng && lng <= b.neLng && lat >= b.swLat && lat <= b.neLat

// Returns true if the point is within either the English or French bbox.
const pointInEitherBbox = (
  lng: number,
  lat: number,
  s: Pick<SchoolCached, 'englishBbox' | 'frenchBbox'>
): boolean =>
  (s.englishBbox != null && pointInBbox(lng, lat, s.englishBbox)) ||
  (s.frenchBbox != null && pointInBbox(lng, lat, s.frenchBbox))

// Coarse lat/lng bbox filter — avoids exact distance calc on distant schools.
const withinApproxBbox = (
  s: SchoolCached,
  lat: number,
  lng: number,
  radiusMeters: number
): boolean => {
  const latDelta = radiusMeters / 111_000
  const lngDelta = radiusMeters / (111_000 * Math.cos((lat * Math.PI) / 180))
  return (
    Math.abs(s.latitude - lat) <= latDelta &&
    Math.abs(s.longitude - lng) <= lngDelta
  )
}

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const params = request.nextUrl.searchParams
  const lng = parseFiniteInRange(params.get('lng'), -180, 180)
  const lat = parseFiniteInRange(params.get('lat'), -90, 90)
  if (lng === null || lat === null) {
    return NextResponse.json(
      { error: 'Invalid or missing lng/lat' },
      { status: 400 }
    )
  }

  const radius = parseFiniteInRange(params.get('radius'), 0, 50_000)
  // Default: include full boundaries (callers typically want to render the
  // matched catchment). Pass `boundaries=false` to strip them.
  const includeBoundaries = parseBoundariesFlag(params) ?? true

  try {
    const schools = await MoveSmartlyAPI.fetchSchools()
    const pt = turfPoint([lng, lat])

    // ── Catchment schools (polygon match) ──────────────────────────
    // Two-step filter: O(1) bbox prefilter, then exact point-in-polygon on the
    // remaining handful of candidates.
    const catchmentSchools = schools
      .filter((s) => pointInEitherBbox(lng, lat, s))
      .flatMap((s) => {
        const serialised = serialiseSchool(s, includeBoundaries, pt)
        const anyMatched = serialised.boundaries?.some((b) => b.matched)
        if (!anyMatched) return []
        return [
          {
            ...serialised,
            name:
              serialised.name != null
                ? `${serialised.name} (Catchment)`
                : serialised.name,
            catchment: true as const
          }
        ]
      })

    // ── Nearby schools (radius) — only when radius param is present ─
    if (radius === null) {
      return NextResponse.json(catchmentSchools)
    }

    const catchmentIds = new Set(catchmentSchools.map((s) => s.id))
    const nearbySchools = schools
      .filter((s) => !catchmentIds.has(String(s.id)))
      .filter((s) => withinApproxBbox(s, lat, lng, radius))
      .filter(
        (s) =>
          turfDistance(pt, turfPoint([s.longitude, s.latitude]), {
            units: 'meters'
          }) <= radius
      )
      .map((s) => ({
        ...serialiseSchool(s, includeBoundaries),
        catchment: false as const
      }))

    return NextResponse.json([...catchmentSchools, ...nearbySchools])
  } catch (error) {
    console.error('[/api/schools/coords] Failed to fetch schools', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 503 }
    )
  }
}
