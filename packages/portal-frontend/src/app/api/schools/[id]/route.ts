import { type NextRequest, NextResponse } from 'next/server'

import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../../_lib'

// Matches positive integer ids up to 10 digits — rejects "1.5", "-1", "abc",
// oversized values, and any path-injection attempts.
const idPattern = /^\d{1,10}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const { id: raw } = await params
  if (!idPattern.test(raw)) {
    return NextResponse.json({ error: 'Invalid school id' }, { status: 400 })
  }
  const id = Number(raw)

  try {
    const schools = await MoveSmartlyAPI.fetchSchools()
    const school = schools.find((s) => s.id === id)
    if (!school) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    // Strip the internal bbox optimisation fields; return every other field as-is.
    const { englishBbox: _en, frenchBbox: _fr, ...full } = school
    return NextResponse.json(full)
  } catch (error) {
    console.error(`[/api/schools/${id}] Failed to fetch schools`, error)
    return NextResponse.json(
      { error: 'Failed to fetch school' },
      { status: 503 }
    )
  }
}
