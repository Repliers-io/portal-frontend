import { type NextRequest, NextResponse } from 'next/server'

import { type Bbox, MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../_lib'

import {
  bboxIntersects,
  finiteInRange,
  matchesFilters,
  parseBoundariesFlag,
  parseFilters,
  serialiseSchool
} from './_lib'

// Accepts the standard map= format: [[[lng,lat],[lng,lat],[lng,lat],[lng,lat]]]
const parseBbox = (mapParam: string): Bbox | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(mapParam)
  } catch {
    return null
  }
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) return null
  const ring = parsed[0] as unknown[]
  if (ring.length < 3) return null
  const coords = ring.filter(
    (c): c is [number, number] =>
      Array.isArray(c) &&
      c.length === 2 &&
      finiteInRange(c[0], -180, 180) &&
      finiteInRange(c[1], -90, 90)
  )
  if (coords.length < 3) return null
  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  return {
    swLng: Math.min(...lngs),
    neLng: Math.max(...lngs),
    swLat: Math.min(...lats),
    neLat: Math.max(...lats)
  }
}

// Fall back to center-point check when the school has no boundary data.
const schoolInViewport = (
  s: {
    latitude: number
    longitude: number
    englishBbox: Bbox | null
    frenchBbox: Bbox | null
  },
  viewport: Bbox
): boolean => {
  if (s.englishBbox && bboxIntersects(s.englishBbox, viewport)) return true
  if (s.frenchBbox && bboxIntersects(s.frenchBbox, viewport)) return true
  return (
    s.latitude >= viewport.swLat &&
    s.latitude <= viewport.neLat &&
    s.longitude >= viewport.swLng &&
    s.longitude <= viewport.neLng
  )
}

const polygonZoomThreshold = 11

// When zoom is below the polygon threshold, the school nearest to the viewport
// centre always gets its boundaries — this covers the case where fitBounds on a
// large catchment still leaves the map below zoom 12.
const nearestToCenter = (
  schools: { id: number; longitude: number; latitude: number }[],
  viewport: Bbox
): number | null => {
  const centerLng = (viewport.swLng + viewport.neLng) / 2
  const centerLat = (viewport.swLat + viewport.neLat) / 2
  let bestId: number | null = null
  let bestDist = Infinity
  for (const s of schools) {
    const d = Math.hypot(s.longitude - centerLng, s.latitude - centerLat)
    if (d < bestDist) {
      bestDist = d
      bestId = s.id
    }
  }
  return bestId
}

const parseZoom = (params: URLSearchParams): number => {
  const raw = params.get('zoom')
  if (raw === null) return 0
  const n = Number(raw)
  return isFinite(n) && n >= 0 && n <= 24 ? n : 0
}

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const mapParam = request.nextUrl.searchParams.get('map')
  if (!mapParam) {
    return NextResponse.json(
      { error: 'Missing required query param: map' },
      { status: 400 }
    )
  }

  const bbox = parseBbox(mapParam)
  if (!bbox) {
    return NextResponse.json({ error: 'Invalid map polygon' }, { status: 400 })
  }

  const filters = parseFilters(request.nextUrl.searchParams)
  const zoom = parseZoom(request.nextUrl.searchParams)
  const boundariesOverride = parseBoundariesFlag(request.nextUrl.searchParams)

  try {
    const schools = await MoveSmartlyAPI.fetchSchools()
    // Explicit `boundaries` query param wins over the zoom-based default.
    const includeBoundaries = boundariesOverride ?? zoom >= polygonZoomThreshold
    const visible = schools
      .filter((s) => schoolInViewport(s, bbox))
      .filter((s) => matchesFilters(s, filters))
    const centerId = !includeBoundaries ? nearestToCenter(visible, bbox) : null
    const serialised = visible.map((s) =>
      serialiseSchool(s, includeBoundaries || s.id === centerId)
    )
    return NextResponse.json(serialised)
  } catch (error) {
    console.error('[/api/schools] Failed to fetch schools', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 503 }
    )
  }
}
