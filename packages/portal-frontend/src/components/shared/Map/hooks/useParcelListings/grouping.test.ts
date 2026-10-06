import type { Feature, FeatureCollection } from 'geojson'

import type { ApiListing } from 'services/API'

import { groupListingsByParcel } from './grouping'

// A unit square, carrying the `id` property that locationsToGeoJson stamps on
// every location feature.
const square = (id: string, offset = 0): Feature => ({
  type: 'Feature',
  properties: { id },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [offset, 0],
        [offset + 1, 0],
        [offset + 1, 1],
        [offset, 1],
        [offset, 0]
      ]
    ]
  }
})

const collection = (...features: Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features
})

const listing = (
  mlsNumber: string,
  longitude: number,
  latitude: number,
  address?: Record<string, string>
) =>
  ({
    mlsNumber,
    class: 'ResidentialProperty',
    address,
    map: { longitude: String(longitude), latitude: String(latitude) }
  }) as unknown as ApiListing

// Real degrees, so the rescue distances in these fixtures are metres: at latitude 30
// a 0.0002 degree side is roughly 20 m.
const lot = (
  id: string,
  name: string,
  lng: number,
  lat: number,
  names?: string[]
): Feature => ({
  type: 'Feature',
  properties: names ? { id, name, names } : { id, name },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [lng, lat],
        [lng + 0.0002, lat],
        [lng + 0.0002, lat + 0.0002],
        [lng, lat + 0.0002],
        [lng, lat]
      ]
    ]
  }
})

// About 15 m west of `lot`'s edge — an agent's pin dropped on the road.
const onTheRoad = (lng: number, lat: number): [number, number] => [
  lng - 0.00016,
  lat + 0.0001
]

describe('groupListingsByParcel', () => {
  it('matches a listing whose point is inside a parcel', () => {
    const { groups, unmatched } = groupListingsByParcel(
      [listing('A1', 0.5, 0.5)],
      collection(square('p1'))
    )
    expect(unmatched).toHaveLength(0)
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('p1')
    expect(groups[0].mlsNumbers).toEqual(['A1'])
  })

  it('leaves a listing outside every parcel unmatched', () => {
    const { groups, unmatched } = groupListingsByParcel(
      [listing('A1', 5, 5)],
      collection(square('p1'))
    )
    expect(groups).toHaveLength(0)
    expect(unmatched.map((l) => l.mlsNumber)).toEqual(['A1'])
  })

  it('collects several listings in one parcel into a single group', () => {
    const { groups } = groupListingsByParcel(
      [listing('A1', 0.2, 0.2), listing('A2', 0.8, 0.8)],
      collection(square('p1'))
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].mlsNumbers).toEqual(['A1', 'A2'])
    expect(groups[0].representative.mlsNumber).toBe('A1')
  })

  it('keeps listings in different parcels apart', () => {
    const { groups } = groupListingsByParcel(
      [listing('A1', 0.5, 0.5), listing('A2', 2.5, 0.5)],
      collection(square('p1'), square('p2', 2))
    )
    expect(groups.map((g) => g.id)).toEqual(['p1', 'p2'])
  })

  it('collapses parcel records that share an identical geometry', () => {
    const { groups } = groupListingsByParcel(
      [listing('A1', 0.5, 0.5)],
      collection(square('p1'), square('p2'))
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('p1')
  })

  it('treats a listing with unusable coordinates as unmatched', () => {
    const broken = { mlsNumber: 'A1', map: {} } as unknown as ApiListing
    const { groups, unmatched } = groupListingsByParcel(
      [broken],
      collection(square('p1'))
    )
    expect(groups).toHaveLength(0)
    expect(unmatched).toHaveLength(1)
  })

  it('rescues a pin on the road by house number and street name', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { groups, unmatched } = groupListingsByParcel(
      [
        listing('A1', pinLng, pinLat, {
          streetNumber: '506',
          streetName: 'Krebs',
          streetSuffix: 'LN'
        })
      ],
      collection(lot('p1', '506 KREBS LN', lng, lat))
    )
    expect(unmatched).toHaveLength(0)
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('p1')
  })

  it('ignores street type, direction and ordinal spelling', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { groups } = groupListingsByParcel(
      [
        listing('A1', pinLng, pinLat, {
          streetNumber: '3702',
          streetName: 'S Second',
          streetSuffix: 'ST'
        })
      ],
      collection(lot('p1', '3702 2ND STREET', lng, lat))
    )
    expect(groups.map((g) => g.id)).toEqual(['p1'])
  })

  it('does not rescue across a parcel with the same address far away', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { groups, unmatched } = groupListingsByParcel(
      [
        listing('A1', pinLng, pinLat, {
          streetNumber: '506',
          streetName: 'Krebs'
        })
      ],
      // Same number and street, roughly a kilometre away — a different segment.
      collection(lot('p1', '506 KREBS LN', lng - 0.01, lat))
    )
    expect(groups).toHaveLength(0)
    expect(unmatched.map((l) => l.mlsNumber)).toEqual(['A1'])
  })

  it('puts a rescued listing in the same group as one already inside', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { groups } = groupListingsByParcel(
      [
        listing('A1', lng + 0.0001, lat + 0.0001),
        listing('A2', pinLng, pinLat, {
          streetNumber: '506',
          streetName: 'Krebs'
        })
      ],
      collection(lot('p1', '506 KREBS LN', lng, lat))
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].mlsNumbers).toEqual(['A1', 'A2'])
  })

  it('matches any address a collapsed stack answers to', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { groups } = groupListingsByParcel(
      [
        listing('A1', pinLng, pinLat, {
          streetNumber: '210',
          streetName: 'Lavaca',
          streetSuffix: 'ST'
        })
      ],
      // One tower, two frontages — the endpoint merged the stack's addresses.
      collection(
        lot('p1', '200 CONGRESS AVE', lng, lat, [
          '200 CONGRESS AVE',
          '210 LAVACA ST'
        ])
      )
    )
    expect(groups.map((g) => g.id)).toEqual(['p1'])
  })

  it('counts how each listing was placed', () => {
    const [lng, lat] = [-97.74, 30.26]
    const [pinLng, pinLat] = onTheRoad(lng, lat)
    const { stats } = groupListingsByParcel(
      [
        listing('A1', lng + 0.0001, lat + 0.0001),
        listing('A2', pinLng, pinLat, {
          streetNumber: '506',
          streetName: 'Krebs'
        }),
        listing('A3', -97.7, 30.2)
      ],
      collection(lot('p1', '506 KREBS LN', lng, lat))
    )
    expect(stats).toEqual({
      listings: 3,
      geometry: 1,
      rescued: 1,
      unmatched: 1
    })
  })

  it('leaves everything unmatched when there are no parcels', () => {
    const { groups, unmatched } = groupListingsByParcel(
      [listing('A1', 0.5, 0.5)],
      undefined
    )
    expect(groups).toHaveLength(0)
    expect(unmatched).toHaveLength(1)
  })
})
