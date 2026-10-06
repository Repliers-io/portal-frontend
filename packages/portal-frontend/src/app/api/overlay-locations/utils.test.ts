import { type ApiLocation } from 'services/API'

import { filterLocationsByCounts } from './utils'

const loc = (name: string, locationId: string): ApiLocation => ({
  locationId,
  name,
  type: 'neighborhood'
})

describe('filterLocationsByCounts', () => {
  it('keeps locations the cache knows with a positive count', () => {
    const locations = [loc('Ballard', 'a'), loc('Fremont', 'b')]
    const counts = new Map([
      ['a', 171],
      ['b', 5]
    ])
    const result = filterLocationsByCounts(locations, counts)
    expect(result.map((l) => l.locationId)).toEqual(['a', 'b'])
  })

  it('drops locations absent from the cache — empty MLS duplicates', () => {
    // Three same-name empties (Beverly Park), none in the cache -> all dropped.
    const locations = [
      loc('Beverly Park', 'lynnwood'),
      loc('Beverly Park', 'mukilteo'),
      loc('Beverly Park', 'edmonds')
    ]
    expect(filterLocationsByCounts(locations, new Map())).toEqual([])
  })

  it('drops even a unique-name location when the cache does not know it', () => {
    expect(filterLocationsByCounts([loc('Ghost', 'g')], new Map())).toEqual([])
  })

  it('keeps the populated member, drops the empty duplicates in a group', () => {
    const locations = [
      loc('Medina', 'bellevue'),
      loc('Medina', 'clydehill'),
      loc('Medina', 'medina')
    ]
    // Only the real one is in the cache.
    const counts = new Map([['medina', 37]])
    const result = filterLocationsByCounts(locations, counts)
    expect(result.map((l) => l.locationId)).toEqual(['medina'])
  })

  it('drops a cache-zero member (defensive; cache normally holds no zeros)', () => {
    const locations = [loc('Z', 'zero'), loc('Z', 'real')]
    const counts = new Map([
      ['zero', 0],
      ['real', 5]
    ])
    const result = filterLocationsByCounts(locations, counts)
    expect(result.map((l) => l.locationId)).toEqual(['real'])
  })

  it('preserves input order', () => {
    const locations = [loc('A', '1'), loc('B', '2'), loc('C', '3')]
    const counts = new Map([
      ['1', 5],
      ['3', 2]
    ])
    const result = filterLocationsByCounts(locations, counts)
    expect(result.map((l) => l.locationId)).toEqual(['1', '3'])
  })
})
