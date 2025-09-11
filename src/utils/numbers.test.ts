import { deriveArea, multiplySqft, parseFootInch } from './numbers'

describe('utils/numbers', () => {
  it('should correctly parse a sqft string', () => {
    expect(parseFootInch('10\'5"')).toBe(125)
    expect(parseFootInch('0\'12"')).toBe(12)
    expect(parseFootInch('28`  4"')).toBe(340)
  })

  it('should return 0 for invalid format', () => {
    expect(parseFootInch('invalid')).toBe(0)
  })

  it('should correctly multiply two sqft strings', () => {
    const result = multiplySqft('10\'5"', '2\'2"')
    expect(result).toEqual({
      inches: 3250,
      feet: 22,
      remainingInches: 82,
      string: '22′82″'
    })
  })
})

describe('deriveArea', () => {
  const SQFT_PER_ACRE = 43560

  it('calculates acres when width and depth are provided', () => {
    const width = 100
    const depth = 200
    const expectedAcres = Number(((width * depth) / SQFT_PER_ACRE).toFixed(4))
    const [w, d, a] = deriveArea(width, depth, undefined)
    expect(w).toBe(width)
    expect(d).toBe(depth)
    expect(a).toBe(expectedAcres)
  })

  it('calculates depth when width and acres are provided', () => {
    const width = 100
    const acres = 2
    const expectedDepth = Math.round((acres * SQFT_PER_ACRE) / width)
    const [w, d, a] = deriveArea(width, undefined, acres)
    expect(w).toBe(width)
    expect(d).toBe(expectedDepth)
    expect(a).toBe(acres)
  })

  it('calculates width when depth and acres are provided', () => {
    const depth = 150
    const acres = 1.5
    const expectedWidth = Math.round((acres * SQFT_PER_ACRE) / depth)
    const [w, d, a] = deriveArea(undefined, depth, acres)
    expect(w).toBe(expectedWidth)
    expect(d).toBe(depth)
    expect(a).toBe(acres)
  })

  it('returns nulls when less than two values are provided', () => {
    // only width
    expect(deriveArea(50, undefined, undefined)).toEqual([50, null, null, null])
    // only depth
    expect(deriveArea(undefined, 80, undefined)).toEqual([null, 80, null, null])
    // only acres AND converted sqft
    expect(deriveArea(undefined, undefined, 3)).toEqual([null, null, 3, 130680])
    // none
    expect(deriveArea(undefined, undefined, undefined)).toEqual([
      null,
      null,
      null,
      null
    ])
  })

  it('treats sqft as acres when provided', () => {
    expect(deriveArea(undefined, undefined, undefined, 130680)).toEqual([
      null,
      null,
      3,
      130680
    ])
  })

  it('treats zero or falsy as missing', () => {
    // width = 0 is falsy, so only depth provided
    expect(deriveArea(0, 100, undefined)).toEqual([null, 100, null, null])
    // depth = 0 is falsy, so only width provided
    expect(deriveArea(120, 0, undefined)).toEqual([120, null, null, null])
  })
})
