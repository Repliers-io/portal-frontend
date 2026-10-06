import type { Feature } from 'geojson'

import { byAddress } from './utils'

const parcel = (name?: string): Feature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: name === undefined ? {} : { name }
})

const sorted = (names: (string | undefined)[]) =>
  names
    .map(parcel)
    .sort(byAddress)
    .map((feature) => feature.properties?.name)

describe('byAddress', () => {
  it('walks a street by house number, then moves to the next street', () => {
    expect(
      sorted([
        '1000 CONGRESS AVE',
        '9 LAVACA ST',
        '1 CONGRESS AVE',
        '10 CONGRESS AVE',
        '2 CONGRESS AVE'
      ])
    ).toEqual([
      '1 CONGRESS AVE',
      '2 CONGRESS AVE',
      '10 CONGRESS AVE',
      '1000 CONGRESS AVE',
      '9 LAVACA ST'
    ])
  })

  it('puts parcels without an address last', () => {
    expect(sorted([undefined, '9 LAVACA ST'])).toEqual([
      '9 LAVACA ST',
      undefined
    ])
  })
})
