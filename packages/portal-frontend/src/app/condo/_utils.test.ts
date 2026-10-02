import { parseCondoUrl } from './_utils'

describe('parseCondoUrl', () => {
  it('reads a name-only URL as a building name', () => {
    expect(parseCondoUrl(['seattle', 'downtown', 'the-emerald'])).toEqual({
      area: '',
      city: 'seattle',
      neighborhood: 'downtown',
      slug: 'the-emerald'
    })
  })

  it('reads a name that ends in a digit as a name, not an address', () => {
    // Regression: "olive-8" / "one88" contain a digit and were misread as addresses,
    // so the building never resolved and the page bounced to the city list.
    expect(parseCondoUrl(['seattle', 'downtown', 'olive-8'])).toEqual({
      area: '',
      city: 'seattle',
      neighborhood: 'downtown',
      slug: 'olive-8'
    })
    expect(parseCondoUrl(['bellevue', 'downtown', 'one88'])).toEqual({
      area: '',
      city: 'bellevue',
      neighborhood: 'downtown',
      slug: 'one88'
    })
  })

  it('reads a 5-segment URL as address + building name', () => {
    expect(
      parseCondoUrl(['seattle', 'downtown', '737-olive', 'olive-8'])
    ).toEqual({
      area: '',
      city: 'seattle',
      neighborhood: 'downtown',
      address: '737-olive',
      slug: 'olive-8'
    })
  })

  it('reads a 4-segment address-only URL (starts with a street number) as an address', () => {
    expect(parseCondoUrl(['seattle', 'downtown', '800-columbia'])).toEqual({
      area: '',
      city: 'seattle',
      neighborhood: 'downtown',
      address: '800-columbia'
    })
  })

  it('extracts an -area prefix and still parses address + name after it', () => {
    expect(
      parseCondoUrl([
        'eastside-area',
        'bellevue',
        'downtown',
        '188-bellevue',
        'one88'
      ])
    ).toEqual({
      area: 'eastside',
      city: 'bellevue',
      neighborhood: 'downtown',
      address: '188-bellevue',
      slug: 'one88'
    })
  })
})
