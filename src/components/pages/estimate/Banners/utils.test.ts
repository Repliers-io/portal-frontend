import {
  calculateClosingCosts,
  calculateCommission,
  calculateLegalFees,
  calculateRprCosts
} from './utils'

describe('calculateCommission', () => {
  it('calculates commission for price <= 100000', () => {
    // 7% + 5% GST
    expect(calculateCommission(80000)).toBeCloseTo(80000 * 0.07 * 1.05)
  })
  it('calculates commission for price > 100000', () => {
    // 7% on first 100k, 3% on rest, + 5% GST
    const price = 200000
    const expected = (100000 * 0.07 + 100000 * 0.03) * 1.05
    expect(calculateCommission(price)).toBeCloseTo(expected)
  })
})

describe('calculateLegalFees', () => {
  it('returns correct fee for price in brackets', () => {
    expect(calculateLegalFees(100000)).toBeCloseTo(1075 * 1.05)
    expect(calculateLegalFees(250000)).toBeCloseTo(1175 * 1.05)
    expect(calculateLegalFees(1000000)).toBeCloseTo(1550 * 1.05)
  })
  it('returns max fee for price above all brackets', () => {
    expect(calculateLegalFees(2000000)).toBeCloseTo(1550 * 1.05)
  })
})

describe('calculateRprCosts', () => {
  it('returns base + city fee for new property', () => {
    expect(calculateRprCosts(5)).toBe(600 + 189)
  })
  it('adds moderate surcharge for property age > 15', () => {
    expect(calculateRprCosts(20)).toBe(800 + 189)
  })
  it('adds significant surcharge for property age > 30', () => {
    expect(calculateRprCosts(40)).toBe(1100 + 189)
  })
})

describe('calculateClosingCosts', () => {
  const baseEstimateData = {
    payload: {
      details: { yearBuilt: 2000 },
      condominium: {}
    },
    estimate: 500000
  }

  it('calculates all costs for non-condo', () => {
    const result = calculateClosingCosts(baseEstimateData as any)
    expect(result.realtor).toBeGreaterThan(0)
    expect(result.legal).toBeGreaterThan(0)
    expect(result.rpr).toBeGreaterThan(0)
    expect(result.discharge).toBe(100)
    expect(result.estoppel).toBe(0)
    expect(result.total).toBeCloseTo(
      result.realtor +
        result.legal +
        result.rpr +
        result.discharge +
        result.estoppel
    )
    expect(result.percentage).toBeCloseTo((result.total / 500000) * 100, 1)
  })

  it('calculates estoppel for condo', () => {
    const condoEstimateData = {
      ...baseEstimateData,
      payload: {
        ...baseEstimateData.payload,
        condominium: { foo: 'bar' }
      }
    }
    const result = calculateClosingCosts(condoEstimateData as any)
    expect(result.estoppel).toBe(300)
  })

  it('handles missing estimateData gracefully', () => {
    const result = calculateClosingCosts(null)
    expect(result.total).toBeGreaterThan(0)
  })
})
