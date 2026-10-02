import { type NextRequest, NextResponse } from 'next/server'

import { fetchListingEnrichedData } from 'services/MoveSmartly'

const enabled = Boolean(process.env.MOVESMARTLY_API_URL)

/** Only alphanumeric, dash, underscore — max 30 chars */
const validMlsNumber = /^[\w-]{1,30}$/

export const GET = async (request: NextRequest) => {
  if (!enabled) return NextResponse.json(null, { status: 404 })

  const mlsNumber = request.nextUrl.searchParams.get('mlsNumber')

  if (!mlsNumber || !validMlsNumber.test(mlsNumber)) {
    return NextResponse.json({ error: 'Invalid mlsNumber' }, { status: 400 })
  }

  const data = await fetchListingEnrichedData(mlsNumber)

  return NextResponse.json(data)
}
