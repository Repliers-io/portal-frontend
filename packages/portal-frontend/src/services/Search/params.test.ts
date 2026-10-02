import type { Position } from 'geojson'

import mapConfig from '@configs/map'
import searchConfig from '@configs/search'

import type { ApiLocation, RawQuery } from 'services/API'

import {
  extractExternalPolygons,
  getMapPolygon,
  getMapRectangle,
  getSearchArea,
  unresolvedExternalIds
} from './params'
import { type Filters } from './types'

// Minimal LngLatBounds stand-in — getSearchArea only reads the corner accessors.
const makeBounds = (west: number, south: number, east: number, north: number) =>
  ({
    getNorthEast: () => ({ lng: east, lat: north }),
    getNorthWest: () => ({ lng: west, lat: north }),
    getSouthWest: () => ({ lng: west, lat: south }),
    getSouthEast: () => ({ lng: east, lat: south })
  }) as unknown as Parameters<typeof getMapRectangle>[0]

const filters = { listingType: 'allListings' } as unknown as Filters
const squareRing: Position[] = [
  [-79, 43],
  [-79, 44],
  [-78, 44],
  [-78, 43],
  [-79, 43]
]

describe('getSearchArea', () => {
  let constrain: boolean
  let extract: boolean
  let boundary: unknown

  beforeEach(() => {
    // Tests run under the defaults tenant; snapshot the config toggles so each
    // case can flip them in isolation and restore afterwards.
    constrain = searchConfig.constrainToSearchBoundary
    extract = searchConfig.extractLocationPolygons
    boundary = mapConfig.searchArea.boundary
    searchConfig.constrainToSearchBoundary = false
    searchConfig.extractLocationPolygons = false
  })

  afterEach(() => {
    searchConfig.constrainToSearchBoundary = constrain
    searchConfig.extractLocationPolygons = extract
    mapConfig.searchArea.boundary = boundary as never
  })

  it('uses the drawn polygon as the region, leaving filters untouched', () => {
    const { filters: out, area } = getSearchArea(filters, {
      polygon: squareRing
    })

    expect(area).toEqual(getMapPolygon(squareRing))
    expect(out).toBe(filters)
  })

  it('falls back to the viewport rectangle when there is no polygon', () => {
    const bounds = makeBounds(-79, 43, -78, 44)

    const { area } = getSearchArea(filters, { bounds })

    expect(area).toEqual(getMapRectangle(bounds))
  })

  it('prefers a point + radius over polygon and bounds', () => {
    const { area } = getSearchArea(filters, {
      point: { center: [43.6, -79.3], radius: 5 },
      polygon: squareRing,
      bounds: makeBounds(-79, 43, -78, 44)
    })

    expect(area).toEqual({ lat: '43.6', long: '-79.3', radius: 5 })
  })

  it('clips the viewport to the tenant boundary when constrainToSearchBoundary is on', () => {
    searchConfig.constrainToSearchBoundary = true
    // 10×10 box as a MultiPolygon — the shape getFetchBounds expects.
    mapConfig.searchArea.boundary = [
      [
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0]
        ]
      ]
    ] as never
    // Viewport far larger than the boundary box.
    const bounds = makeBounds(-5, -5, 15, 15)

    const { area } = getSearchArea(filters, { bounds }) as {
      area: { map: Position[][][] }
    }

    // A raw rectangle would span -5..15; the clipped region must stay in 0..10.
    expect(area).not.toEqual(getMapRectangle(bounds))
    for (const [lng, lat] of area.map.flat(2)) {
      expect(lng).toBeGreaterThanOrEqual(0)
      expect(lng).toBeLessThanOrEqual(10)
      expect(lat).toBeGreaterThanOrEqual(0)
      expect(lat).toBeLessThanOrEqual(10)
    }
  })

  it('keeps every ring of a multi-polygon region through the boundary clip', () => {
    searchConfig.constrainToSearchBoundary = true
    mapConfig.searchArea.boundary = [
      [
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0]
        ]
      ]
    ] as never
    // Two disjoint rings (a re-saved two-location region), both inside the
    // boundary. Each must survive as its own polygon — the bug wrapped both into
    // one polygon, reading the second ring as a hole and dropping it.
    const ringA: Position[] = [
      [1, 1],
      [3, 1],
      [3, 3],
      [1, 3],
      [1, 1]
    ]
    const ringB: Position[] = [
      [7, 7],
      [9, 7],
      [9, 9],
      [7, 9],
      [7, 7]
    ]

    const { area } = getSearchArea(filters, { polygon: [ringA, ringB] }) as {
      area: { map: Position[][][] }
    }

    // Both rings clipped-in → two polygons in the MultiPolygon, one near each
    // source ring (not just the first).
    expect(area.map).toHaveLength(2)
    const xs = area.map.flat(2).map(([lng]) => lng)
    expect(Math.min(...xs)).toBeLessThan(5)
    expect(Math.max(...xs)).toBeGreaterThan(5)
  })

  describe('external overlay selections (POST queries mode)', () => {
    const externalId = 'schools-208-e1s1p1c1f0'
    const externalBoundary: Position[][][] = [[squareRing]]
    const externalLocation = {
      locationId: externalId,
      type: 'school',
      external: true,
      map: { boundary: externalBoundary }
    } as unknown as ApiLocation
    // Viewport that fully covers the external polygon (-79..-78 / 43..44).
    const bounds = makeBounds(-100, 0, 100, 80)

    const queriesOf = (area: unknown): RawQuery[] =>
      (area as { queries: RawQuery[] }).queries

    it('unions native ids and the external polygon as two queries, viewport inside the native one', () => {
      const { filters: out, area } = getSearchArea(
        { locationId: 'LOC1', externalLocationId: externalId } as Filters,
        { locations: [externalLocation], bounds }
      )

      const queries = queriesOf(area)
      expect(queries).toHaveLength(2)
      expect(queries[0]).toEqual({
        locationId: ['LOC1'],
        map: getMapRectangle(bounds).map
      })
      // Clipped external polygon stays within its own extent.
      for (const [lng, lat] of (queries[1].map as Position[][][]).flat(2)) {
        expect(lng).toBeGreaterThanOrEqual(-79)
        expect(lng).toBeLessThanOrEqual(-78)
        expect(lat).toBeGreaterThanOrEqual(43)
        expect(lat).toBeLessThanOrEqual(44)
      }
      // Both id filters left the request — a leftover locationId would AND
      // against the union, a leftover externalLocationId would leak to the API.
      expect(out).not.toHaveProperty('locationId')
      expect(out).not.toHaveProperty('externalLocationId')
      expect(area).not.toHaveProperty('map')
    })

    it('sends a single polygon query when only external locations are selected', () => {
      const { area } = getSearchArea(
        { externalLocationId: externalId } as Filters,
        { locations: [externalLocation], bounds }
      )

      const queries = queriesOf(area)
      expect(queries).toHaveLength(1)
      expect(queries[0]).toHaveProperty('map')
      expect(queries[0]).not.toHaveProperty('locationId')
    })

    it('falls back to the unclipped polygon when the selection is fully off-screen', () => {
      const farAway = makeBounds(10, 10, 20, 20)

      const { area } = getSearchArea(
        { externalLocationId: externalId } as Filters,
        { locations: [externalLocation], bounds: farAway }
      )

      expect(queriesOf(area)).toEqual([getMapPolygon(externalBoundary)])
    })

    it('keeps the legacy request when no external location is selected', () => {
      const { filters: out, area } = getSearchArea(filters, { bounds })

      expect(out).toBe(filters)
      expect(area).toEqual(getMapRectangle(bounds))
    })
  })

  describe('unresolvedExternalIds', () => {
    it('reports selected external ids whose location has no boundary yet', () => {
      const pending = {
        locationId: 'schools-1-e1s1p1c1f0',
        external: true
      } as unknown as ApiLocation

      expect(
        unresolvedExternalIds(
          {
            externalLocationId: ['schools-1-e1s1p1c1f0']
          } as unknown as Filters,
          [pending]
        )
      ).toEqual(['schools-1-e1s1p1c1f0'])
      expect(
        unresolvedExternalIds({ externalLocationId: '' } as Filters, null)
      ).toEqual([])
    })
  })

  describe('extractExternalPolygons', () => {
    it('preserves filters identity when nothing external is selected', () => {
      const result = extractExternalPolygons(filters, null)
      expect(result.filters).toBe(filters)
      expect(result.polygons).toEqual([])
    })
  })

  it('searches by the location polygon and drops its id from filters when extractLocationPolygons is on', () => {
    searchConfig.extractLocationPolygons = true
    const locationId = 'LOC1'
    const locationBoundary: Position[][][] = [[squareRing]]
    const locations = [
      { locationId, type: 'neighborhood', map: { boundary: locationBoundary } }
    ] as unknown as ApiLocation[]

    const { filters: out, area } = getSearchArea(
      { locationId } as unknown as Filters,
      { locations, bounds: makeBounds(-100, 0, 100, 80) }
    )

    // The matched id searches by polygon now, so it leaves `filters.locationId`.
    expect(out.locationId).toEqual([])
    expect(area).toEqual(getMapPolygon(locationBoundary))
  })
})

describe('getMapPolygon', () => {
  it('passes a MultiPolygon through unflattened', () => {
    // Repliers reads flat rings as ONE polygon (outer + holes): flattened, only
    // the first of several selected areas would match.
    const shifted = squareRing.map(([lng, lat]) => [lng + 5, lat])
    const multi: Position[][][] = [[squareRing], [shifted]]

    expect(getMapPolygon(multi)).toEqual({ map: multi })
  })
})
