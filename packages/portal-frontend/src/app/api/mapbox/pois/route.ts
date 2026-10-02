import { type NextRequest, NextResponse } from 'next/server'

import { assertSameOrigin } from '../../_lib'

import {
  cacheGet,
  cacheKey,
  cacheSet,
  parseBbox,
  parseCategories,
  parseLimit,
  parseProximity
} from './_lib'
import { fetchFromSearchBox, searchboxConfigured } from './_searchbox'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const params = request.nextUrl.searchParams

  const categories = parseCategories(params.get('categories'))
  if (!categories) {
    return NextResponse.json(
      {
        error:
          'Invalid or missing categories (expected: comma-separated grocery|bus|subway|train)'
      },
      { status: 400 }
    )
  }

  const bbox = parseBbox(params.get('bbox'))
  if (!bbox) {
    return NextResponse.json(
      {
        error: 'Invalid or missing bbox (expected: minLng,minLat,maxLng,maxLat)'
      },
      { status: 400 }
    )
  }

  if (!searchboxConfigured()) {
    return NextResponse.json(
      { error: 'Search Box provider is not configured' },
      { status: 503 }
    )
  }

  const proximity = parseProximity(params.get('proximity'))
  const limit = parseLimit(params.get('limit'), 25)

  const key = cacheKey(categories, bbox, limit)
  const cached = cacheGet(key)
  if (cached) return NextResponse.json(cached)

  try {
    const collection = await fetchFromSearchBox(
      categories,
      bbox,
      proximity,
      limit,
      request.signal
    )
    cacheSet(key, collection)
    return NextResponse.json(collection)
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') {
      return new NextResponse(null, { status: 499 })
    }
    console.error('[/api/mapbox/pois] upstream failure', error)
    return NextResponse.json(
      { error: 'Upstream POI request failed' },
      { status: 502 }
    )
  }
}
