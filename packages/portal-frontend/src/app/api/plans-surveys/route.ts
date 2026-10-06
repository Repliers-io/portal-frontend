import { type NextRequest, NextResponse } from 'next/server'

import { fetchPlansAndSurveys } from 'services/ProtectYourBoundaries'

const enabled = Boolean(process.env.PYB_API_URL)

const finiteInRange = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && isFinite(v) && v >= min && v <= max

export const GET = async (request: NextRequest) => {
  if (!enabled) return NextResponse.json(null, { status: 404 })

  const latParam = request.nextUrl.searchParams.get('lat')
  const lngParam = request.nextUrl.searchParams.get('lng')

  const lat = latParam !== null ? Number(latParam) : NaN
  const lng = lngParam !== null ? Number(lngParam) : NaN

  if (!finiteInRange(lat, -90, 90) || !finiteInRange(lng, -180, 180)) {
    return NextResponse.json(
      { error: 'Invalid lat/lng parameters' },
      { status: 400 }
    )
  }

  const result = await fetchPlansAndSurveys(lat, lng)

  return NextResponse.json(result)
}
