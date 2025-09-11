import {
  formatEnglishPrice,
  formatImperialDistance,
  formatLongNumber,
  formatPercentage,
  formatPrice,
  toAffirmative,
  toSafeNumber,
  toSafeString
} from './formatters'

describe('utils/formatters', () => {
  it('should always return number', () => {
    expect(toSafeNumber(1)).toEqual(1)
    expect(toSafeNumber(-1)).toEqual(-1)
    expect(toSafeNumber(true)).toEqual(1)
    expect(toSafeNumber(false)).toEqual(0)
    expect(toSafeNumber(undefined)).toEqual(0)
    expect(toSafeNumber(NaN)).toEqual(0)
    expect(toSafeNumber(Infinity)).toEqual(0)
    expect(toSafeNumber('string')).toEqual(0)
    expect(toSafeNumber('')).toEqual(0)
    expect(toSafeNumber('1')).toEqual(1)
    expect(toSafeNumber('1.00')).toEqual(1)
    expect(toSafeNumber('1.23')).toEqual(1.23)
    expect(toSafeNumber(null)).toEqual(0)
  })

  it('should always return string', () => {
    expect(toSafeString(1)).toEqual('1')
    expect(toSafeString(-1)).toEqual('-1')
    expect(toSafeString(true)).toEqual('1')
    expect(toSafeString(undefined)).toEqual('0')
    expect(toSafeString(NaN)).toEqual('0')
    expect(toSafeString(Infinity)).toEqual('0')
    expect(toSafeString(null)).toEqual('0')
  })

  it('should always have the sign for positive and negative values', () => {
    expect(formatPercentage(1)).toEqual('+1%')
    expect(formatPercentage(-1)).toEqual('-1%')
    expect(formatPercentage(0)).toEqual('0%')
  })

  it('should format numbers with suffixes', () => {
    expect(formatLongNumber(0)).toEqual('0')
    expect(formatLongNumber(1)).toEqual('1')
    expect(formatLongNumber(10)).toEqual('10')
    expect(formatLongNumber(999)).toEqual('999')
    // no hanging zero (.0)
    expect(formatLongNumber(1000)).toEqual('1K')
    // // rounding checks
    expect(formatLongNumber(1050)).toEqual('1.05K')
    expect(formatLongNumber(5050)).toEqual('5.05K')
    expect(formatLongNumber(9999)).toEqual('10K')
    expect(formatLongNumber(10500)).toEqual('11K')
    expect(formatLongNumber(99900)).toEqual('100K')
    expect(formatLongNumber(99999)).toEqual('100K')
    expect(formatLongNumber(234567)).toEqual('235K')
    expect(formatLongNumber(999400)).toEqual('999K')
    expect(formatLongNumber(999900)).toEqual('1M')
    expect(formatLongNumber(999999)).toEqual('1M')
    // suffixes
    expect(formatLongNumber(1234567)).toEqual('1.23M')
    expect(formatLongNumber(1234567890)).toEqual('1.23B')
    expect(formatLongNumber(1234567890123)).toEqual('1.23T')
    // precission digits
    expect(formatLongNumber(1234567, 0)).toEqual('1M')
    expect(formatLongNumber(1500000, 0)).toEqual('2M')
    expect(formatLongNumber(1234567, 1)).toEqual('1.2M')
    expect(formatLongNumber(1234567, 3)).toEqual('1.235M')
    // no suffixes past T(rillion) are available
    expect(formatLongNumber(1111111111111111)).toEqual('1111T')
    expect(formatLongNumber(1234567890123456)).toEqual('1235T')
    // eslint-disable-next-line no-loss-of-precision
    expect(formatLongNumber(9999999999999999)).toEqual('10000T')
  })

  it('should format price the same way as long numbers', () => {
    expect(formatPrice(0)).toEqual('$0')
    expect(formatPrice(9)).toEqual('$9')
    expect(formatPrice(1234)).toEqual('$1.23K')
    expect(formatPrice(99999)).toEqual('$100K')
    // custom currency
    expect(formatPrice(1, '£')).toEqual('£1')
  })

  it('should format english price with commas', () => {
    expect(formatEnglishPrice(0)).toEqual('$0')
    expect(formatEnglishPrice(true)).toEqual('$1')
    expect(formatEnglishPrice(NaN)).toEqual('$0')
    expect(formatEnglishPrice(Infinity)).toEqual('$0')
    expect(formatEnglishPrice(null)).toEqual('$0')
    expect(formatEnglishPrice(undefined)).toEqual('$0')
    expect(formatEnglishPrice('')).toEqual('$0')
    expect(formatEnglishPrice('1')).toEqual('$1')
    expect(formatEnglishPrice('123.00')).toEqual('$123')
    expect(formatEnglishPrice('1234.56')).toEqual('$1,234.56')
    expect(formatEnglishPrice('1234.56', 0)).toEqual('$1,235')
    expect(formatEnglishPrice(995)).toEqual('$995')
    expect(formatEnglishPrice(1234)).toEqual('$1,234')
    expect(formatEnglishPrice(1234, 2, 'GBP')).toEqual('£1,234')
    expect(formatEnglishPrice(1234567)).toEqual('$1,234,567')
    expect(formatEnglishPrice(1234.5678)).toEqual('$1,234.57')
  })

  it('should format random imperial numbers', () => {
    expect(formatImperialDistance(0)).toEqual('0′ 0″')
    expect(formatImperialDistance(1)).toEqual('0′ 1″')
    expect(formatImperialDistance(12)).toEqual('1′ 0″')
    expect(formatImperialDistance(13)).toEqual('1′ 1″')
    expect(formatImperialDistance('12`2"')).toEqual('12′ 2″')
    // strings should be returned as is, if cant be parsed
    expect(formatImperialDistance('0')).toEqual('0')
    expect(formatImperialDistance('scrubbed')).toEqual('scrubbed')
  })

  it('should return Yes or No for values of any type', () => {
    expect(toAffirmative('y')).toBe('Yes')
    expect(toAffirmative('Y')).toBe('Yes')
    expect(toAffirmative('n')).toBe('No')
    expect(toAffirmative('N')).toBe('No')
    expect(toAffirmative(true)).toBe('Yes')
    expect(toAffirmative(false)).toBe('No')
    expect(toAffirmative(null)).toBe('No')
    expect(toAffirmative(undefined)).toBe('No')
    expect(toAffirmative(1)).toBe('Yes')
    expect(toAffirmative(0)).toBe('No')
    expect(toAffirmative({})).toBe('Yes')
    expect(toAffirmative([])).toBe('Yes')
  })
})
