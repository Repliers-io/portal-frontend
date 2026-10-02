import { type NextRequest, NextResponse } from 'next/server'

import { type LocationType } from 'services/API'
import { APILocations } from 'services/API/APILocations'
import { locationsToGeoJson } from 'services/API/locationsToGeoJson'
import { loadCountsMap } from 'services/LocationsTree'
import { locationFields } from 'utils/map/overlays'

import { filterLocationsByCounts } from './utils'

const emptyCollection = { type: 'FeatureCollection' as const, features: [] }

/**
 * Server-side overlay-locations fetch with empty-location filtering. The
 * neighborhoods overlay routes its `fetchData` here (via `fetchDedupedLocations`)
 * instead of hitting `APILocations` directly: dirty MLS `/locations` data returns
 * many empty neighborhoods (often same-name duplicates under different parent
 * cities). We keep only locations present in the static locations-cache allowlist
 * (`countsMap`, resolved server-side so counts never ship to the client) and drop
 * the rest.
 *
 * Pass-through contract: surviving locations keep their real Repliers
 * `locationId` and are NOT flagged `external`, so the map selects them as native
 * `locationId`s exactly as before — only the empties are removed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') as LocationType | null
  const source = searchParams.get('source')
  const lat = Number(searchParams.get('lat'))
  const long = Number(searchParams.get('long'))
  const radius = Number(searchParams.get('radius'))
  const markers = searchParams.get('markers') === 'true'
  // Mirror `fetchLocations`: boundary restriction defaults ON, off only when
  // explicitly 'false' (MLS neighborhood centroids carry no boundary).
  const boundaryOnly = searchParams.get('boundaryOnly') !== 'false'

  if (!type || !source || ![lat, long, radius].every(Number.isFinite)) {
    return NextResponse.json(emptyCollection, { status: 400 })
  }

  try {
    const response = await APILocations.fetch({
      source,
      type,
      lat,
      long,
      radius,
      ...(boundaryOnly ? { hasBoundary: true } : {}),
      fields: locationFields
    })

    const countsMap = await loadCountsMap()
    const locations = filterLocationsByCounts(
      response?.locations ?? [],
      countsMap
    )

    return NextResponse.json(locationsToGeoJson(locations, { markers }))
  } catch (error) {
    console.error('[overlay-locations]', error)
    return NextResponse.json(emptyCollection, { status: 500 })
  }
}
