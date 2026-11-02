import routes from '@configs/routes'

import { getMapUrl } from './urls'

describe('getMapUrl', () => {
  // the off-map Autosuggestion button pushed bare `routes.map` before it carried filters
  it('adds nothing for absent or empty filters', () => {
    expect(getMapUrl({})).toBe(routes.map)
    expect(getMapUrl({ filters: {} })).toBe(routes.map)
  })

  it('serializes only the non-default filters', () => {
    expect(
      getMapUrl({
        filters: {
          listingStatus: 'sold',
          listingType: 'allListings',
          minBedrooms: 2,
          minPrice: 500000,
          maxPrice: 0
        }
      })
    ).toBe(`${routes.map}?listingStatus=sold&minBedrooms=2&minPrice=500000`)
  })
})
