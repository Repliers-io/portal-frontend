import { buildSpecs, mergeBuildings, parseMapAddress } from './assembleBuilding'

const t = (key: string) => key

describe('utils/buildings/buildSpecs', () => {
  const makeApiBuilding = (overrides: Record<string, any> = {}) => ({
    details: {},
    condominium: {},
    ...overrides
  })

  it('returns empty values when no sources provided', () => {
    const result = buildSpecs(t)
    expect(result.every((item) => !item.value)).toBe(true)
  })

  it('uses API yearBuilt over CMS built', () => {
    const api = makeApiBuilding({ details: { yearBuilt: '2020' } })
    const acf = { built: '2015' } as any

    const result = buildSpecs(t, api as any, acf)
    const yearBuilt = result.find((item) => item.label === 'built')

    expect(yearBuilt?.value).toBe('2020')
  })

  it('falls back to CMS built when API has none', () => {
    const acf = { built: '2015' } as any

    const result = buildSpecs(t, undefined, acf)
    const yearBuilt = result.find((item) => item.label === 'built')

    expect(yearBuilt?.value).toBe('2015')
  })

  it('uses API stories over CMS stories', () => {
    const api = makeApiBuilding({ condominium: { stories: 30 } })
    const acf = { stories: 25 } as any

    const result = buildSpecs(t, api as any, acf)
    const stories = result.find((item) => item.label === 'stories')

    expect(stories?.value).toBe(30)
  })

  it('includes CMS-only fields', () => {
    const acf = {
      units: '200',
      architect: 'Frank Gehry',
      developer: 'Acme Corp',
      builder: 'Builder Inc',
      rental_cap: '25%'
    } as any

    const result = buildSpecs(t, undefined, acf)

    expect(result.find((i) => i.label === 'units')?.value).toBe('200')
    expect(result.find((i) => i.label === 'architect')?.value).toBe(
      'Frank Gehry'
    )
    expect(result.find((i) => i.label === 'developer')?.value).toBe('Acme Corp')
    expect(result.find((i) => i.label === 'builder')?.value).toBe('Builder Inc')
    expect(result.find((i) => i.label === 'rentalCap')?.value).toBe('25%')
  })

  it('formats condo size range when both min and max provided', () => {
    const api = makeApiBuilding({
      details: { minSqft: 500, maxSqft: 1200 }
    })

    const result = buildSpecs(t, api as any)
    const condoSize = result.find((i) => i.label === 'condoSize')

    expect(condoSize?.value).toBe('500 sqft - 1,200 sqft')
  })

  it('formats single size when min equals max', () => {
    const api = makeApiBuilding({
      details: { minSqft: 800, maxSqft: 800 }
    })

    const result = buildSpecs(t, api as any)
    const condoSize = result.find((i) => i.label === 'condoSize')

    expect(condoSize?.value).toBe('800 sqft')
  })

  it('returns null condoSize when no size data', () => {
    const result = buildSpecs(t)
    const condoSize = result.find((i) => i.label === 'condoSize')

    expect(condoSize?.value).toBeNull()
  })
})

describe('utils/buildings/mergeBuildings', () => {
  const makeApiBuilding = (overrides: Record<string, any> = {}) => ({
    name: 'API Tower',
    slug: 'api-tower',
    image: 'https://example.com/api.jpg',
    address: {
      area: 'Downtown',
      city: 'Toronto',
      neighborhood: 'Waterfront'
    },
    map: { latitude: '43.65', longitude: '-79.38' },
    condominium: { amenities: ['gym', 'pool'] },
    nearby: { amenities: ['park'] },
    details: { buildingName: 'API Tower' },
    ...overrides
  })

  const makeCmsBuilding = (overrides: Record<string, any> = {}) => ({
    id: 1,
    name: 'CMS Tower',
    slug: 'cms-tower',
    description: '<p>A great building</p>',
    ...overrides
  })

  const makeAcf = (overrides: Record<string, any> = {}) => ({
    slideshow: [{ small: 's.jpg', medium: 'm.jpg', large: 'l.jpg' }],
    amenities: ['doorman'],
    description: 'ACF description',
    sections: [{ heading: 'About', content: 'Info' }],
    faqs: [{ question: 'Q?', answer: 'A.' }],
    map: { lat: '43.64', lng: '-79.37', zoom: 15, address: '100 Main St' },
    map_description: 'Near the lake',
    ...overrides
  })

  const emptySpecs = [] as any[]

  it('returns minimal building with no sources', () => {
    const result = mergeBuildings({ specs: emptySpecs })

    expect(result.name).toBe('')
    expect(result.gallery).toEqual([])
    expect(result.amenities).toEqual([])
    expect(result.sections).toEqual([])
    expect(result.faqs).toEqual([])
    expect(result.reviews.posts).toEqual([])
  })

  it('uses API name over CMS name', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      cmsBuilding: makeCmsBuilding() as any,
      specs: emptySpecs
    })

    expect(result.name).toBe('API Tower')
  })

  it('falls back to CMS name when no API', () => {
    const result = mergeBuildings({
      cmsBuilding: makeCmsBuilding() as any,
      specs: emptySpecs
    })

    expect(result.name).toBe('CMS Tower')
  })

  it('uses CMS slug when available', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      cmsBuilding: makeCmsBuilding() as any,
      specs: emptySpecs
    })

    expect(result.slug).toBe('cms-tower')
  })

  it('uses API address', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      specs: emptySpecs
    })

    expect(result.address?.city).toBe('Toronto')
  })

  it('resolves location from explicit param over address', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      specs: emptySpecs,
      location: { city: 'Vancouver' }
    })

    expect(result.location.city).toBe('Vancouver')
  })

  it('falls back location to address fields', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      specs: emptySpecs
    })

    expect(result.location.city).toBe('Toronto')
    expect(result.location.neighborhood).toBe('Waterfront')
  })

  it('uses API map coordinates when available', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      specs: emptySpecs
    })

    expect(result.map?.lat).toBe(43.65)
    expect(result.map?.lng).toBe(-79.38)
  })

  it('falls back to ACF map when no API map', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding({ map: {} }) as any,
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.map?.lat).toBe(43.64)
    expect(result.map?.lng).toBe(-79.37)
  })

  it('returns no map when neither source has coordinates', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding({ map: {} }) as any,
      specs: emptySpecs
    })

    expect(result.map).toBeUndefined()
  })

  it('uses API amenities over CMS amenities', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.amenities).toEqual(['gym', 'pool'])
  })

  it('falls back to ACF amenities when API has none', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding({ condominium: {} }) as any,
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.amenities).toEqual(['doorman'])
  })

  it('uses gallery from ACF slideshow', () => {
    const result = mergeBuildings({
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.gallery).toHaveLength(1)
    expect(result.gallery[0].large).toBe('l.jpg')
  })

  it('prefers API image for heroImage', () => {
    const result = mergeBuildings({
      apiBuilding: makeApiBuilding() as any,
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.heroImage).toBe('https://example.com/api.jpg')
  })

  it('falls back to gallery first image for heroImage', () => {
    const result = mergeBuildings({
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.heroImage).toBe('l.jpg')
  })

  it('merges CMS description and ACF description', () => {
    const result = mergeBuildings({
      cmsBuilding: makeCmsBuilding() as any,
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.description).toBe('<p>A great building</p>ACF description')
  })

  it('includes sections and faqs from ACF', () => {
    const result = mergeBuildings({
      acf: makeAcf() as any,
      specs: emptySpecs
    })

    expect(result.sections).toHaveLength(1)
    expect(result.faqs).toHaveLength(1)
  })

  it('preserves raw sources', () => {
    const api = makeApiBuilding()
    const cms = makeCmsBuilding()

    const result = mergeBuildings({
      apiBuilding: api as any,
      cmsBuilding: cms as any,
      specs: emptySpecs
    })

    expect(result.apiBuilding).toBe(api)
    expect(result.cmsBuilding).toBe(cms)
  })
})

describe('utils/buildings/parseMapAddress', () => {
  it('returns undefined for empty input', () => {
    expect(parseMapAddress(undefined)).toBeUndefined()
    expect(parseMapAddress('')).toBeUndefined()
  })

  it('returns undefined for unparseable input', () => {
    expect(parseMapAddress('Some Random Text')).toBeUndefined()
  })

  it('parses street, city, state, zip', () => {
    const result = parseMapAddress('588 Bell St, Seattle, WA 98121')
    expect(result).toEqual({
      streetNumber: '588',
      streetName: 'Bell',
      city: 'Seattle',
      state: 'WA',
      zip: '98121'
    })
  })

  it('parses street, city, state without zip', () => {
    const result = parseMapAddress('300 Boylston Ave E, Seattle, WA')
    expect(result).toMatchObject({
      streetNumber: '300',
      streetName: 'Boylston Ave E',
      city: 'Seattle',
      state: 'WA'
    })
  })

  it('parses Canadian address', () => {
    const result = parseMapAddress('100 King St, Toronto, ON M5V 3C9')
    expect(result).toMatchObject({
      streetNumber: '100',
      streetName: 'King',
      city: 'Toronto',
      state: 'ON'
    })
  })

  it('handles full address with country suffix gracefully', () => {
    // addresser may or may not parse "United States" — we just ensure no crash
    const result = parseMapAddress(
      '588 Bell St, Seattle, WA 98121, United States'
    )
    expect(result).toBeDefined()
    expect(result?.city).toBe('Seattle')
    expect(result?.state).toBe('WA')
  })
})
