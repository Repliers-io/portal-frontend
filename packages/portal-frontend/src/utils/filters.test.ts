import {
  containsRawValues,
  countAdvancedFilters,
  foreignRawReset,
  getUnknownFilters,
  leaseSearch,
  mergeBuckets,
  nonDefaultFilter,
  pickRawFilters,
  rankOptions,
  rawFieldLabel,
  rawSelection,
  rawValues,
  selectedRawFields
} from './filters'

describe('mergeBuckets', () => {
  const buckets = {
    '1000000-1100000': 1,
    '1100000-1200000': 2,
    '1200000-1300000': 3,
    '1300000-1400000': 4,
    '1400000-1500000': 5,
    '1500000-1600000': 6,
    '1600000-1700000': 7,
    '1700000-1800000': 8,
    '1800000-1900000': 9,
    '1900000-2000000': 10,
    '2000000-2100000': 11,
    '2100000-2200000': 12,
    '2200000-2300000': 13,
    '2300000-2400000': 14,
    '2400000-2500000': 15,
    '2500000-2600000': 16,
    '2600000-2700000': 17
  }

  it('should merge sale buckets correctly', () => {
    const expected = {
      '1000000-1200000': 3,
      '1200000-1400000': 7,
      '1400000-1600000': 11,
      '1600000-2000000': 34,
      '2000000-2400000': 50,
      '2400000-2700000': 48
    }

    const result = mergeBuckets(buckets)
    expect(result).toEqual(expected)
  })

  it('should merge rent buckets correctly', () => {
    const rentBuckets = {
      '3000-3500': 1,
      '3500-4000': 2,
      '4000-4500': 3,
      '4500-5000': 4,
      '5000-5500': 5,
      '5500-6000': 6,
      '6000-6500': 7,
      '6500-7000': 8,
      '7000-7500': 9,
      '7500-8000': 10,
      '8000-8500': 11,
      '8500-9000': 12,
      '9000-9500': 13,
      '9500-10000': 14,
      '10000+': 15
    }

    const expected = {
      '3000-3500': 1,
      '3500-4000': 2,
      '4000-5000': 7,
      '5000-6000': 11,
      '6000-8000': 34,
      '8000-10000': 50,
      '10000+': 15
    }

    const result = mergeBuckets(rentBuckets, 'rent')
    expect(result).toEqual(expected)
  })

  it('should return the same buckets if no merging is required', () => {
    const noMergeBuckets = {
      '500-1000': 11,
      '1000-1500': 22,
      '1500-2000': 33
    }

    const expected = {
      '500-1000': 11,
      '1000-1500': 22,
      '1500-2000': 33
    }

    const result = mergeBuckets(noMergeBuckets, 'sale')
    expect(result).toEqual(expected)
  })

  it('should handle empty buckets', () => {
    const emptyBuckets = {}
    const expected = {}

    const result = mergeBuckets(emptyBuckets, 'sale')
    expect(result).toEqual(expected)
  })
})

describe('rankOptions', () => {
  const counts = { tile: 5, carpet: 9, '': 40, adobe: 1, wood: 9 }

  it('orders values alphabetically by default and drops the empty value', () => {
    expect(rankOptions(counts)).toEqual(['adobe', 'carpet', 'tile', 'wood'])
  })

  it('orders by count, keeping ties in their input order', () => {
    expect(rankOptions(counts, { sort: 'popularity' })).toEqual([
      'carpet',
      'wood',
      'tile',
      'adobe'
    ])
  })

  it('drops values counted below minCount', () => {
    expect(rankOptions(counts, { minCount: 5 })).toEqual([
      'carpet',
      'tile',
      'wood'
    ])
  })
})

describe('leaseSearch', () => {
  it('reads the rent status and the lease transaction type', () => {
    expect(leaseSearch({ listingStatus: 'rent' })).toBe(true)
    expect(leaseSearch({ listingStatus: ['active', 'rent'] })).toBe(true)
    expect(leaseSearch({ type: 'lease' })).toBe(true)
    expect(leaseSearch({ listingStatus: 'active' })).toBe(false)
  })
})

describe('countAdvancedFilters', () => {
  it('counts a scalar set over an undefined default', () => {
    expect(countAdvancedFilters({ openHouse: 'any' }, ['openHouse'])).toBe(1)
    expect(countAdvancedFilters({ openHouse: undefined }, ['openHouse'])).toBe(
      0
    )
  })
})

describe('raw filters', () => {
  it('lists the fields that hold a selection', () => {
    expect(
      selectedRawFields({
        'raw.View': ['lake'],
        'raw.Roof': [],
        'raw.Sewer': undefined,
        minPrice: 100
      })
    ).toEqual(['View'])
  })

  it('clears the selections of fields missing from the new type', () => {
    expect(
      foreignRawReset(
        { 'raw.PetsAllowed': ['cats ok'], 'raw.View': ['lake'] },
        ['View']
      )
    ).toEqual({ 'raw.PetsAllowed': undefined })
  })

  it('takes only listed fields from URL params, as arrays', () => {
    expect(
      pickRawFilters(
        {
          'raw.View': 'lake',
          'raw.Roof': ['metal', 'tile'],
          'raw.PetsAllowed': 'cats ok',
          search: 'pool'
        },
        ['View', 'Roof']
      )
    ).toEqual({ 'raw.View': ['lake'], 'raw.Roof': ['metal', 'tile'] })
  })

  it('treats a raw field as set only while it holds values', () => {
    expect(nonDefaultFilter(['raw.View', ['lake']], {})).toBe(true)
    expect(nonDefaultFilter(['raw.View', []], {})).toBe(false)
    expect(nonDefaultFilter(['raw.View', undefined], {})).toBe(false)
  })

  it('counts each selected field once and never as unknown', () => {
    const filters = {
      ...rawSelection('View', ['lake', 'river']),
      ...rawSelection('Roof', ['metal'])
    }
    expect(rawValues(filters, 'View')).toEqual(['lake', 'river'])
    expect(getUnknownFilters(filters)).toEqual([])
    expect(countAdvancedFilters(filters, [])).toBe(2)
  })

  it('turns only raw selections into contains matches', () => {
    expect(
      containsRawValues({
        'raw.LaundryFeatures': ['inunit', 'washerhookup'],
        'raw.ArchitecturalStyle': undefined,
        search: 'pool'
      })
    ).toEqual({
      'raw.LaundryFeatures': ['contains:inunit', 'contains:washerhookup'],
      'raw.ArchitecturalStyle': undefined,
      search: 'pool'
    })
  })

  it('writes an emptied field as unset', () => {
    expect(rawSelection('View', [])).toEqual({ 'raw.View': undefined })
  })

  it('labels a field by its RESO name, without the word "Features"', () => {
    expect(rawFieldLabel('PatioAndPorchFeatures')).toBe('Patio and porch')
    expect(rawFieldLabel('Appliances')).toBe('Appliances')
  })
})
