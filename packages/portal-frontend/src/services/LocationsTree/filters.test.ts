import { getLocationUrl } from 'utils/urls'

import { findCityByName, getAreaUrl, resolveLocation } from './filters'
import { type Tree, type TreeNode } from './types'

const city = (name: string, locationId: string, activeCount?: number) =>
  ({ name, locationId, activeCount }) as unknown as TreeNode

describe('findCityByName', () => {
  it('matches by normalized name (case/space-insensitive)', () => {
    const cities = [city('Central Toronto', 'C1', 5)]
    expect(findCityByName(cities, 'central toronto')?.locationId).toBe('C1')
  })

  it('returns undefined when nothing matches', () => {
    expect(findCityByName([city('Toronto', 'C1', 5)], 'Ottawa')).toBeUndefined()
  })

  it('on a name collision, picks the node with the highest activeCount', () => {
    // TRREB "Ashton" exists in both Ottawa and Lanark with different ids.
    const cities = [city('Ashton', 'LANARK', 7), city('Ashton', 'OTTAWA', 10)]
    expect(findCityByName(cities, 'Ashton')?.locationId).toBe('OTTAWA')
  })

  it('deduplicates identical duplicate branches (same id) deterministically', () => {
    // TRREB "Toronto" appears twice with the same locationId and count.
    const cities = [
      city('Toronto', 'CAONCIWVICYYVV', 18918),
      city('Toronto', 'CAONCIWVICYYVV', 18918)
    ]
    expect(findCityByName(cities, 'Toronto')?.locationId).toBe('CAONCIWVICYYVV')
  })

  it('treats a missing activeCount as 0 when comparing', () => {
    const cities = [
      city('Ashford', 'NO_COUNT'),
      city('Ashford', 'HAS_COUNT', 8)
    ]
    expect(findCityByName(cities, 'Ashford')?.locationId).toBe('HAS_COUNT')
  })
})

const hood = (name: string, locationId: string, activeCount?: number) =>
  ({ name, locationId, activeCount }) as unknown as TreeNode

const tree = {
  areas: [
    {
      name: 'King',
      cities: [
        {
          name: 'Seattle',
          locationId: 'SEA',
          neighborhoods: [
            hood('Arbor Heights', 'AH', 12),
            hood('Central Area', 'CA', 75)
          ]
        },
        {
          name: 'Tukwila',
          locationId: 'TUK',
          neighborhoods: [hood('Allentown', 'ALW', 7)]
        }
      ]
    }
  ]
} as unknown as Tree

describe('resolveLocation', () => {
  it('maps a space-stripped slug back to the spelling the API knows', () => {
    // `/condo-buildings/seattle/arborheights` parses to city Seattle, hood Arborheights
    const { cityNode, hoodNode } = resolveLocation(tree, {
      city: 'Seattle',
      hood: 'Arborheights'
    })
    expect(cityNode?.name).toBe('Seattle')
    expect(hoodNode?.name).toBe('Arbor Heights')
  })

  it('leaves an unknown neighbourhood unresolved', () => {
    const { cityNode, hoodNode } = resolveLocation(tree, {
      city: 'Seattle',
      hood: 'Nowhere'
    })
    expect(cityNode?.name).toBe('Seattle')
    expect(hoodNode).toBeUndefined()
  })

  it('scopes the neighbourhood to its own city', () => {
    // Allentown belongs to Tukwila, so it must not resolve under Seattle.
    expect(
      resolveLocation(tree, { city: 'Seattle', hood: 'Allentown' }).hoodNode
    ).toBeUndefined()
    expect(
      resolveLocation(tree, { city: 'Tukwila', hood: 'Allentown' }).hoodNode
        ?.locationId
    ).toBe('ALW')
  })

  it('resolves nothing when no city was parsed out of the URL', () => {
    expect(
      resolveLocation(tree, { hood: 'Arborheights' }).hoodNode
    ).toBeUndefined()
  })

  // A tenant can record a place as an area whose children are cities — TRREB has
  // Toronto that way, with North York and Scarborough beneath it. Its short URL
  // puts the name in the city position, where no city answers to it.
  it('falls back to an area when the city position names one', () => {
    const { areaNode, cityNode } = resolveLocation(tree, { city: 'King' })
    expect(areaNode?.name).toBe('King')
    expect(cityNode).toBeUndefined()
  })

  it('prefers a city over an area of the same name', () => {
    const shared = {
      areas: [...tree.areas, { name: 'Seattle', cities: [] }]
    } as unknown as Tree
    const { areaNode, cityNode } = resolveLocation(shared, { city: 'Seattle' })
    expect(cityNode?.locationId).toBe('SEA')
    expect(areaNode).toBeUndefined()
  })

  it('does not look for an area once a city has answered', () => {
    expect(resolveLocation(tree, { city: 'Seattle' }).areaNode).toBeUndefined()
  })

  it('leaves a URL that also names a neighbourhood unresolved', () => {
    // An area page cannot answer for a neighbourhood, so /xx/king/allentown
    // must not quietly render King.
    expect(
      resolveLocation(tree, { city: 'King', hood: 'Allentown' }).areaNode
    ).toBeUndefined()
  })
})

describe('getAreaUrl', () => {
  it('gives an area the short URL when no city shares its name', () => {
    expect(getAreaUrl(tree, 'King')).toBe(getLocationUrl({ city: 'King' }))
  })

  it('keeps the -area marker when a city owns the short URL', () => {
    expect(getAreaUrl(tree, 'Seattle')).toBe(
      getLocationUrl({ area: 'Seattle' })
    )
  })

  // `/xx/central-area` parses to "Central" on the strength of the suffix alone,
  // even where no such area exists — the canonical must echo that URL rather
  // than send the visitor to a different page.
  it('leaves a name that is no area at all on the marker form', () => {
    expect(getAreaUrl(tree, 'Central')).toBe(
      getLocationUrl({ area: 'Central' })
    )
  })
})
