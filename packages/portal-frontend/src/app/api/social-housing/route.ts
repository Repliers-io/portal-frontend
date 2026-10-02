import { type NextRequest, NextResponse } from 'next/server'

import type { LatLngBounds, SocialHousing } from 'services/MoveSmartly'
import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../_lib'

// Parses the same map= polygon format used by /api/parcel:
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

  try {
    const data: SocialHousing[] =
      await MoveSmartlyAPI.fetchSocialHousing(bounds)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch social housing' },
      { status: 503 }
    )
  }
}
