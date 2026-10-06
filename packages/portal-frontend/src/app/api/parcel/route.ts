import { type NextRequest, NextResponse } from 'next/server'
import type { Feature, MultiPolygon, Polygon } from 'geojson'

import { simplify } from '@turf/turf'

import type { LatLngBounds, Parcel } from 'services/MoveSmartly'
import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../_lib'

// Parses the same map= polygon format used by /api/schools:
// [[[neLng,neLat],[nwLng,nwLat],[swLng,swLat],[seLng,seLat]]]
const parseBounds = (raw: string | null): LatLngBounds | null => {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
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
      typeof c[0] === 'number' &&
      typeof c[1] === 'number'
  )
  if (coords.length < 3) return null
  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  return {
    southWest: { lat: Math.min(...lats), lng: Math.min(...lngs) },
    northEast: { lat: Math.max(...lats), lng: Math.max(...lngs) }
  }
}

// Tolerance doubles per zoom step below 16 (Douglas-Peucker):
//   zoom 16 → 0.000005° ≈ 0.55 m
//   zoom 15 → 0.000010° ≈ 1.1 m
//   zoom 14 → 0.000020° ≈ 2.2 m
//   zoom 13 → 0.000040° ≈ 4.4 m
const simplifyParcel = (parcel: Parcel, zoom: number): Parcel => {
  const tolerance = 0.000005 * Math.pow(2, 16 - zoom)
  const simplified = simplify(
    {
      type: 'Feature',
      geometry: parcel.boundary,
      properties: {}
    } as Feature<Polygon | MultiPolygon>,
    { tolerance, highQuality: false }
  )
  return { ...parcel, boundary: simplified.geometry }
}

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const bounds = parseBounds(request.nextUrl.searchParams.get('map'))
  if (!bounds) {
    return NextResponse.json(
      { error: 'Invalid or missing map polygon' },
      { status: 400 }
    )
  }

  const rawZoom = Number(request.nextUrl.searchParams.get('zoom'))
  const zoom = Number.isFinite(rawZoom) ? rawZoom : Infinity

  try {
    // const fetchStart = performance.now()
    const parcels = await MoveSmartlyAPI.fetchParcels(bounds)
    // const fetchMs = (performance.now() - fetchStart).toFixed(1)

    // const simplifyStart = performance.now()
    const result =
      zoom <= 16 ? parcels.map((p) => simplifyParcel(p, zoom)) : parcels
    // const simplifyMs = (performance.now() - simplifyStart).toFixed(1)

    // console.log(
    //   `\x1b[1;36m[/api/parcel]\x1b[0m upstream=\x1b[33m${fetchMs}ms\x1b[0m simplify=\x1b[33m${simplifyMs}ms\x1b[0m count=\x1b[32m${parcels.length}\x1b[0m zoom=\x1b[35m${zoom}\x1b[0m`
    // )

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch parcels' },
      { status: 503 }
    )
  }
}
