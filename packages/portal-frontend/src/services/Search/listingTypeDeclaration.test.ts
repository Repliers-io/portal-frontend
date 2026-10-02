import filtersConfig from '@configs/filters'

import { listingTypeDeclaration } from './listingTypeDeclaration'

describe('Search/listingTypeDeclaration', () => {
  it('does not store allListings in the config declaration (it is derived here)', () => {
    expect(filtersConfig.listingTypeDeclaration.allListings).toBeUndefined()
  })

  it('adds a derived allListings entry: fixed class + union of every type propertyType', () => {
    const { allListings } = listingTypeDeclaration
    expect(allListings?.class).toEqual(['residential', 'condo'])

    const union = new Set(
      Object.values(filtersConfig.listingTypeDeclaration).flatMap(
        (group) => (group?.propertyType as string[]) ?? []
      )
    )
    expect(new Set(allListings?.propertyType as string[])).toEqual(union)
  })

  it('de-duplicates the allListings propertyType union', () => {
    const props = listingTypeDeclaration.allListings?.propertyType as string[]
    expect(props.length).toBe(new Set(props).size)
  })

  it('keeps rendered listingTypes + derived penthouse/loft, drops non-rendered keys', () => {
    const rendered = filtersConfig.listingTypes.filter(
      (type) => type !== 'allListings'
    )
    rendered.forEach((type) =>
      expect(listingTypeDeclaration[type]).toBeDefined()
    )
    // penthouse / loft are derived from condo (search shortcuts), never stored
    expect(listingTypeDeclaration.penthouse?.search).toBe('penthouse')
    expect(listingTypeDeclaration.loft?.search).toBe('loft')
    // the default tenant surfaces none of these — the resolver drops them
    expect(listingTypeDeclaration.residentialTownhome).toBeUndefined()
    expect(listingTypeDeclaration.other).toBeUndefined()
  })
})
