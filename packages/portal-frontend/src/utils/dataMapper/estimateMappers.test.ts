import { type EstimatePayload } from '@configs/estimate'

import {
  mapperEstimateAnnualTaxes,
  mapperEstimateArrayJoin,
  mapperEstimateInteriorSize,
  mapperEstimateLotArea,
  mapperEstimateLotDimensions,
  mapperEstimateLotDimensionsRounded,
  mapperEstimateMaintenanceFee,
  mapperEstimateMortgageBalance,
  mapperEstimatePurchaseDate,
  mapperEstimatePurchasePrice
} from './estimateMappers'

const payload = (over: Record<string, unknown> = {}) =>
  over as unknown as EstimatePayload

describe('mapperEstimateArrayJoin', () => {
  it('joins arrays with comma', () => {
    expect(mapperEstimateArrayJoin(payload(), ['Brick', 'Vinyl'])).toBe(
      'Brick, Vinyl'
    )
  })

  it('passes through a non-array value', () => {
    expect(mapperEstimateArrayJoin(payload(), 'Brick')).toBe('Brick')
  })
})

describe('mapperEstimateAnnualTaxes', () => {
  it('rounds and formats as currency', () => {
    expect(mapperEstimateAnnualTaxes(payload(), 5234.67)).toBe('$5,235')
  })
})

describe('mapperEstimateLotDimensions', () => {
  it('keeps the raw frontage and depth (no rounding by default)', () => {
    expect(
      mapperEstimateLotDimensions(
        payload({ lot: { width: 50.4, depth: 100.6 } })
      )
    ).toBe('50.4 x 100.6')
  })

  it('returns null when width or depth is missing', () => {
    expect(
      mapperEstimateLotDimensions(payload({ lot: { width: 50 } }))
    ).toBeNull()
  })
})

describe('mapperEstimateLotDimensionsRounded', () => {
  it('rounds width and depth so no fractional part shows', () => {
    expect(
      mapperEstimateLotDimensionsRounded(
        payload({ lot: { width: 50.4, depth: 100.6 } })
      )
    ).toBe('50 x 101')
  })

  it('returns null when width or depth is missing', () => {
    expect(
      mapperEstimateLotDimensionsRounded(payload({ lot: { width: 50 } }))
    ).toBeNull()
  })
})

describe('mapperEstimateLotArea', () => {
  it('rounds the area derived from width * depth', () => {
    expect(
      mapperEstimateLotArea(payload({ lot: { width: 50, depth: 100.6 } }))
    ).toBe('5,030 sqft')
  })

  it('derives the area from acres when width/depth are missing', () => {
    expect(mapperEstimateLotArea(payload({ lot: { acres: '0.5' } }))).toBe(
      '21,780 sqft'
    )
  })

  it('returns null when no lot dimensions are present', () => {
    expect(mapperEstimateLotArea(payload({ lot: {} }))).toBeNull()
  })
})

describe('mapperEstimateInteriorSize', () => {
  it('rounds the square footage so no decimals show', () => {
    expect(mapperEstimateInteriorSize(payload(), 1234.56)).toBe('1,235 sqft')
  })

  it('returns null when the value is empty', () => {
    expect(mapperEstimateInteriorSize(payload(), undefined)).toBeNull()
  })
})

describe('mapperEstimateMaintenanceFee', () => {
  it('rounds and formats as currency', () => {
    expect(mapperEstimateMaintenanceFee(payload(), '450.75')).toBe('$451')
  })

  it('returns null when the value is empty', () => {
    expect(mapperEstimateMaintenanceFee(payload(), undefined)).toBeNull()
  })
})

describe('mapperEstimatePurchasePrice', () => {
  it('rounds and formats as currency', () => {
    expect(mapperEstimatePurchasePrice(payload(), '750000.4')).toBe('$750,000')
  })
})

describe('mapperEstimateMortgageBalance', () => {
  it('rounds and formats as currency', () => {
    expect(mapperEstimateMortgageBalance(payload(), '500000')).toBe('$500,000')
  })
})

describe('mapperEstimatePurchaseDate', () => {
  it('formats the provided date', () => {
    expect(mapperEstimatePurchaseDate(payload(), '2023-06-15')).toContain(
      '2023'
    )
  })
})
