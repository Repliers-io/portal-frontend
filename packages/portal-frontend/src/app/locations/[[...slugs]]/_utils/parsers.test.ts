import {
  cityPositionArea,
  filter,
  parseListingType,
  parseUrlFilters,
  parseUrlParams,
  parseUrlPrice
} from './parsers'

// ---------------------------------------------------------------------------
// filter — URL segment classifier (location slug vs filters slug)
// ---------------------------------------------------------------------------

describe('filter — segment classifier', () => {
  // Real location slugs from tenant trees that once misclassified as filters:
  // 'new'/'business'/'land'/'home' matched as bare prefixes or mid-segment tokens.
  it.each([
    'newmarket',
    'newcastle',
    'newtonbrook',
    'new-toronto',
    'new-tecumseth',
    'rural-new-tecumseth',
    'new-lowell',
    'newmarket-industrial-park',
    'beaver-creek-business-park',
    'pine-valley-business-park',
    '401-business-park',
    'landsdale',
    'homeside',
    'bath'
  ])('location slug %s is NOT a filter', (slug) => {
    expect(filter(slug)).toBe(false)
  })

  // Every shape of generated filter segment (popularSearches joins, chips, menus).
  it.each([
    'for-sale',
    'for-rent',
    'sort-priceAsc',
    'under-1m',
    'below-500k',
    'above-2m',
    'new',
    'new-listings',
    'new-construction',
    'sold',
    'open',
    'luxury',
    'condos',
    'houses',
    'townhomes',
    'condos-for-sale',
    'luxury-condos',
    'new-homes-for-sale',
    '3-bedroom',
    '2-baths',
    '1-bedroom-condos-for-rent',
    '2-bedrooms-houses-for-sale',
    'houses-for-sale-under-1m'
  ])('filter slug %s IS a filter', (slug) => {
    expect(filter(slug)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// parseUrlPrice
// ---------------------------------------------------------------------------

describe('parseUrlPrice', () => {
  it('parses millions (m suffix)', () => {
    expect(parseUrlPrice('below-1m')).toBe(1_000_000)
    expect(parseUrlPrice('under-1.5m')).toBe(1_500_000)
    expect(parseUrlPrice('above-2m')).toBe(2_000_000)
  })

  it('parses thousands (k suffix)', () => {
    expect(parseUrlPrice('below-500k')).toBe(500_000)
    expect(parseUrlPrice('above-800k')).toBe(800_000)
    expect(parseUrlPrice('under-750k')).toBe(750_000)
  })

  it('parses raw numbers', () => {
    expect(parseUrlPrice('below-1000000')).toBe(1_000_000)
    expect(parseUrlPrice('above-500000')).toBe(500_000)
  })

  it('strips $ and , before parsing', () => {
    expect(parseUrlPrice('below-$1,000,000')).toBe(1_000_000)
  })

  it('handles all prefixes identically for the same amount', () => {
    expect(parseUrlPrice('below-1m')).toBe(parseUrlPrice('under-1m'))
  })
})

// ---------------------------------------------------------------------------
// parseUrlFilters — price
// ---------------------------------------------------------------------------

describe('parseUrlFilters — price', () => {
  it('below- sets maxPrice', () => {
    expect(parseUrlFilters(['below-1m']).maxPrice).toBe(1_000_000)
  })

  it('under- sets maxPrice (alias)', () => {
    expect(parseUrlFilters(['under-1m']).maxPrice).toBe(1_000_000)
  })

  it('above- sets minPrice', () => {
    expect(parseUrlFilters(['above-500k']).minPrice).toBe(500_000)
  })

  it('both price bounds together', () => {
    const result = parseUrlFilters(['above-500k', 'below-1m'])
    expect(result.minPrice).toBe(500_000)
    expect(result.maxPrice).toBe(1_000_000)
  })
})

// ---------------------------------------------------------------------------
// parseUrlFilters — count filters
// ---------------------------------------------------------------------------

describe('parseUrlFilters — bedrooms', () => {
  it.each([['1-bed'], ['1-beds'], ['1-bedroom'], ['1-bedrooms']])(
    '%s → minBedrooms 1',
    (filter) => {
      expect(parseUrlFilters([filter]).minBedrooms).toBe(1)
    }
  )

  it('3-bedrooms → minBedrooms 3', () => {
    expect(parseUrlFilters(['3-bedrooms']).minBedrooms).toBe(3)
  })
})

describe('parseUrlFilters — bathrooms', () => {
  it.each([['2-bath'], ['2-baths'], ['2-bathroom'], ['2-bathrooms']])(
    '%s → minBaths 2',
    (filter) => {
      expect(parseUrlFilters([filter]).minBaths).toBe(2)
    }
  )
})

describe('parseUrlFilters — garage', () => {
  it.each([['1-garage'], ['1-garages']])('%s → minGarageSpaces 1', (filter) => {
    expect(parseUrlFilters([filter]).minGarageSpaces).toBe(1)
  })
})

describe('parseUrlFilters — parking', () => {
  it.each([['2-parking'], ['2-parkings']])(
    '%s → minParkingSpaces 2',
    (filter) => {
      expect(parseUrlFilters([filter]).minParkingSpaces).toBe(2)
    }
  )
})

// ---------------------------------------------------------------------------
// parseUrlFilters — listing status
// ---------------------------------------------------------------------------

describe('parseUrlFilters — listing status', () => {
  it('defaults to active', () => {
    expect(parseUrlFilters([]).listingStatus).toBe('active')
  })

  it('sold → listingStatus sold', () => {
    expect(parseUrlFilters(['sold']).listingStatus).toBe('sold')
  })

  it('for-rent → listingStatus rent', () => {
    expect(parseUrlFilters(['for-rent']).listingStatus).toBe('rent')
  })

  it('for-lease → listingStatus rent', () => {
    expect(parseUrlFilters(['for-lease']).listingStatus).toBe('rent')
  })

  it('for-rent → type lease (cannot be overridden by config sale default)', () => {
    expect(parseUrlFilters(['for-rent']).type).toBe('lease')
  })

  it('non-rent leaves type unset (config default applies)', () => {
    expect(parseUrlFilters([]).type).toBeUndefined()
    expect(parseUrlFilters(['sold']).type).toBeUndefined()
  })

  it('any → listingStatus all', () => {
    expect(parseUrlFilters(['any']).listingStatus).toBe('all')
  })

  it('all → listingStatus all', () => {
    expect(parseUrlFilters(['all']).listingStatus).toBe('all')
  })
})

// ---------------------------------------------------------------------------
// parseUrlFilters — sortBy
// ---------------------------------------------------------------------------

describe('parseUrlFilters — sortBy', () => {
  it('defaults to createdOnDesc', () => {
    expect(parseUrlFilters([]).sortBy).toBe('createdOnDesc')
  })

  it('sort-priceAsc → sortBy priceAsc', () => {
    expect(parseUrlFilters(['sort-priceAsc']).sortBy).toBe('priceAsc')
  })

  it('sort-priceDesc → sortBy priceDesc', () => {
    expect(parseUrlFilters(['sort-priceDesc']).sortBy).toBe('priceDesc')
  })
})

// ---------------------------------------------------------------------------
// parseListingType
// ---------------------------------------------------------------------------

describe('parseListingType', () => {
  it('defaults to allListings', () => {
    expect(parseListingType([])).toBe('allListings')
  })

  it.each([
    [['condo'], 'condo'],
    [['condos'], 'condo'],
    [['apartment'], 'condo'],
    [['apartments'], 'condo']
  ])('%s → %s', (filters, expected) => {
    expect(parseListingType(filters)).toBe(expected)
  })

  it.each([
    [['home'], 'residential'],
    [['homes'], 'residential'],
    [['house'], 'residential'],
    [['houses'], 'residential'],
    [['residential'], 'residential']
  ])('%s → %s', (filters, expected) => {
    expect(parseListingType(filters)).toBe(expected)
  })

  // 'semi' and 'detached' are URL tokens that now map to real listingType values
  it('semi → semiDetached', () => {
    expect(parseListingType(['semi'])).toBe('semiDetached')
  })

  it('detached → residential (detached homes)', () => {
    expect(parseListingType(['detached'])).toBe('residential')
  })

  // The class-aware townhouse split is opt-in per tenant (via listingTypes).
  // Under defaults those keys are absent, so `townhomes` stays class-agnostic.
  it('townhomes → townhome (no class-aware split for this tenant)', () => {
    expect(parseListingType(['townhomes'])).toBe('townhome')
    expect(parseListingType(['condos', 'townhomes'])).toBe('townhome')
  })

  it.each([['land'], ['commercial']])('%s → %s (strict match)', (filter) => {
    expect(parseListingType([filter])).toBe(filter)
  })
})

// ---------------------------------------------------------------------------
// Combined filter combinations
// ---------------------------------------------------------------------------

describe('parseUrlFilters — combined', () => {
  it('condos + 2-bed + under-1m + for-rent', () => {
    const result = parseUrlFilters(['condos', '2-bed', 'under-1m', 'for-rent'])
    expect(result.listingType).toBe('condo')
    expect(result.minBedrooms).toBe(2)
    expect(result.maxPrice).toBe(1_000_000)
    expect(result.listingStatus).toBe('rent')
  })

  it('homes + 3-bedrooms + above-500k + below-2m', () => {
    const result = parseUrlFilters([
      'homes',
      '3-bedrooms',
      'above-500k',
      'below-2m'
    ])
    expect(result.listingType).toBe('residential')
    expect(result.minBedrooms).toBe(3)
    expect(result.minPrice).toBe(500_000)
    expect(result.maxPrice).toBe(2_000_000)
  })

  it('4-bed + 2-bath + 1-garage + 1-parking', () => {
    const result = parseUrlFilters(['4-bed', '2-bath', '1-garage', '1-parking'])
    expect(result.minBedrooms).toBe(4)
    expect(result.minBaths).toBe(2)
    expect(result.minGarageSpaces).toBe(1)
    expect(result.minParkingSpaces).toBe(1)
  })

  it('sold + commercial + sort-priceAsc', () => {
    const result = parseUrlFilters(['sold', 'commercial', 'sort-priceAsc'])
    expect(result.listingStatus).toBe('sold')
    expect(result.listingType).toBe('commercial')
    expect(result.sortBy).toBe('priceAsc')
  })
})

// ---------------------------------------------------------------------------
// parseUrlParams — location routing
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// cityPositionArea — areas written without the `-area` marker
// ---------------------------------------------------------------------------

describe('cityPositionArea', () => {
  const areas = ['Toronto', 'York Region']

  it.each([
    ['toronto', true],
    ['york-region', true],
    ['north-york', false],
    // The marker form is matched by the suffix rule, not by this one.
    ['toronto-area', false],
    // A longer name that merely starts with a listed one stays a city.
    ['toronto-gore-rural-estate', false]
  ])('%s → %s', (segment, expected) =>
    expect(cityPositionArea(segment, areas)).toBe(expected)
  )

  it('matches nothing when the tenant lists no areas', () => {
    expect(cityPositionArea('toronto', [])).toBe(false)
  })
})

describe('parseUrlParams — location segments', () => {
  it('empty slugs → empty location', () => {
    const { location } = parseUrlParams([])
    expect(location.city).toBe('')
    expect(location.area).toBe('')
    expect(location.neighborhood).toBe('')
  })

  it('city slug', () => {
    const { location } = parseUrlParams(['seattle'])
    expect(location.city).toBe('Seattle')
  })

  it('area slug', () => {
    const { location } = parseUrlParams(['king-county-area'])
    expect(location.area).toBe('King County')
  })

  it('neighborhood ending in "Area" is not swallowed by the area marker', () => {
    const { location } = parseUrlParams(['seattle', 'central-area'])
    expect(location.city).toBe('Seattle')
    expect(location.neighborhood).toBe('Central Area')
    expect(location.area).toBe('')
  })

  it('city + neighborhood slugs', () => {
    const { location } = parseUrlParams(['seattle', 'capitol-hill'])
    expect(location.city).toBe('Seattle')
    expect(location.neighborhood).toBe('Capitol Hill')
  })

  it('new-prefixed city slug resolves as a city, not filters', () => {
    const { location, filters } = parseUrlParams(['newmarket'])
    expect(location.city).toBe('Newmarket')
    expect(filters).toEqual([])
  })

  it('new-prefixed city + filters segment', () => {
    const { location, filters } = parseUrlParams([
      'newmarket',
      'condos-for-sale'
    ])
    expect(location.city).toBe('Newmarket')
    expect(filters).toContain('condos')
    expect(filters).toContain('for-sale')
  })

  it('filter segment extracted separately from location', () => {
    const { location, filters } = parseUrlParams(['seattle', 'condos'])
    expect(location.city).toBe('Seattle')
    expect(filters).toContain('condos')
  })

  it('compound filter segment: 2-bedrooms-condos-for-sale parsed correctly', () => {
    const { filters } = parseUrlParams([
      'seattle',
      '2-bedrooms-condos-for-sale'
    ])
    expect(filters).toContain('2-bedrooms')
    expect(filters).toContain('condos')
    expect(filters).toContain('for-sale')
  })

  it('listing ID segment detected', () => {
    // slug must not contain words from allValues (listing/property/properties)
    // otherwise 'filter()' intercepts it as a filter segment
    const { listingId, localAddress } = parseUrlParams([
      'seattle',
      '123-oak-street-12345'
    ])
    expect(listingId).toBe('12345')
    expect(localAddress).toBe('123 Oak Street')
  })
})
