import { type NextRequest, NextResponse } from 'next/server'

import { APILocations } from 'services/API/APILocations'
import { locationsToGeoJson } from 'services/API/locationsToGeoJson'
import { locationFields } from 'utils/map/overlays'

import { assertSameOrigin } from '../_lib'

import {
  byAddress,
  collapseByFootprint,
  compactCollection,
  dedupeLocations,
  validMapPolygon
} from './utils'

const emptyCollection = { type: 'FeatureCollection' as const, features: [] }

// One page is as large as the upstream allows, and ten of them cover the densest
// viewport we measured (downtown Austin at zoom 15: 9127 parcels). The ceiling sits
// two pages above that, so a denser viewport still cannot pull tens of megabytes.
const resultsPerPage = 1000
const maxPages = 12

/**
 * Public-record parcels for a viewport, as one GeoJSON FeatureCollection.
 *
 * The client used to page this itself, which meant ten round-trips and 3.9 MB of JSON
 * parsed on the main thread for a dense viewport. Paging here collapses that to one
 * request, and lets the duplicate rows the upstream returns be dropped once, server
 * side, instead of in every consumer.
 */
export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const map = validMapPolygon(request.nextUrl.searchParams.get('map'))
  if (!map) {
    return NextResponse.json(emptyCollection, { status: 400 })
  }

  // The assessor record, opt-in per request: 142 fields on every parcel, which the
  // listing page wants for the one parcel it draws and the viewport layer — tens to
  // thousands of parcels a pan — must not pay for.
  const publicRecord = request.nextUrl.searchParams.get('publicRecord') === '1'

  const params = {
    map,
    type: 'property',
    source: 'PublicRecord',
    hasBoundary: true,
    resultsPerPage,
    fields: publicRecord ? `${locationFields},publicRecord` : locationFields
  }

  try {
    const first = await APILocations.fetch(params)
    const pages = Math.min(first?.numPages ?? 1, maxPages)

    // In parallel, not in sequence: ten round-trips one after another would cost
    // seconds. These run server side, next to the backend.
    const rest = await Promise.all(
      Array.from({ length: Math.max(pages - 1, 0) }, (_, index) =>
        APILocations.fetch({ ...params, pageNum: index + 2 })
      )
    )

    const received = [first, ...rest].map((page) => page?.locations)
    const rows = received.reduce(
      (total, page) => total + (page?.length ?? 0),
      0
    )
    const locations = dedupeLocations(received)

    // A foreign top-level member, which GeoJSON allows and `useOverlayLayers`
    // ignores — it reads `features`. `dropped` is the visible symptom of the
    // upstream's overlapping pages: it has no stable sort to page against, so the
    // same parcel arrives twice while another is missed entirely.
    //
    // No `count` here on purpose. `APILocations.fetch` overwrites the upstream total
    // with the length of the page it just deduped, so the only honest total we hold
    // is `rows` — what actually arrived.
    const collection = compactCollection(
      collapseByFootprint(locationsToGeoJson(locations)),
      publicRecord ? ['publicRecord'] : []
    )

    // One order for every consumer, since the upstream has none: street, then house
    // number. The parcel dialog's arrows walk the viewport along it.
    collection.features.sort(byAddress)

    const meta = {
      numPages: first?.numPages ?? 0,
      pagesFetched: pages,
      rows,
      unique: locations.length,
      dropped: rows - locations.length,
      footprints: collection.features.length,
      stacked: locations.length - collection.features.length
    }

    return NextResponse.json({ ...collection, meta })
  } catch (error) {
    console.error('[public-record]', error)
    return NextResponse.json(emptyCollection, { status: 500 })
  }
}
