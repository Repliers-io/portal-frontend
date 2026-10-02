import { expandTree, toCacheFile, toCompactTree } from './cache'

const source = [
  {
    locationId: 'area-1',
    name: 'Toronto Area',
    type: 'area',
    source: 'UserDefined',
    address: { state: 'ON', country: 'CA' },
    map: {
      latitude: 43.65321987654,
      longitude: -79.3832,
      boundary: [[[[0, 0]]]]
    },
    cities: [
      {
        locationId: 'city-1',
        name: 'Toronto',
        activeCount: 100,
        map: { latitude: 43.6532, longitude: -79.3832 },
        neighborhoods: [
          { locationId: 'hood-1', name: 'Annex', activeCount: 10 }
        ]
      }
    ]
  }
]

describe('locations cache format', () => {
  it('keeps only what the runtime reads, coordinates as a rounded pair', () => {
    const [area] = toCompactTree(source)

    expect(area).toEqual({
      i: 'area-1',
      n: 'Toronto Area',
      p: [43.65322, -79.3832],
      s: [
        {
          i: 'city-1',
          n: 'Toronto',
          c: 100,
          p: [43.6532, -79.3832],
          s: [{ i: 'hood-1', n: 'Annex', c: 10 }]
        }
      ]
    })
  })

  it('restores the tree shape, children named by depth', () => {
    const { areas } = expandTree(toCompactTree(source))
    const [city] = areas[0].cities

    expect(city.name).toBe('Toronto')
    expect(city.map).toEqual({ latitude: 43.6532, longitude: -79.3832 })
    expect(city.neighborhoods?.[0].name).toBe('Annex')
    // No coordinates in, no `map` out — the fetchers treat that as unplaced.
    expect(city.neighborhoods?.[0].map).toBeUndefined()
  })
  it('stamps the query source once in the header, not on every node', () => {
    const withSource = [{ ...source[0], source: 'UserDefined' }]
    const file = toCacheFile(withSource, { metadata: {} as never })

    expect(file.source).toBe('UserDefined')
    expect(JSON.stringify(file.tree)).not.toContain('UserDefined')
  })
})
