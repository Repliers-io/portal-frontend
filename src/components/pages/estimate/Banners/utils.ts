import type { EstimateData } from '@defaults/estimate'

// 7%/3% commission structure with GST
export const calculateCommission = (price: number) => {
  const firstTier = Math.min(price, 100000) * 0.07
  const remaining = Math.max(price - 100000, 0) * 0.03
  return (firstTier + remaining) * 1.05 // Includes 5% GST
}

// Progressive legal fee brackets with GST
export const calculateLegalFees = (price: number) => {
  const brackets = [
    [100000, 1075],
    [200000, 1150],
    [300000, 1175],
    [400000, 1250],
    [500000, 1275],
    [600000, 1350],
    [700000, 1375],
    [800000, 1450],
    [900000, 1475],
    [1000000, 1550]
  ]

  const [, fee] = brackets.find(([limit]) => price <= limit) || [Infinity, 1550]
  return fee * 1.05 // Includes 5% GST
}

// RPR with municipal compliance (base + variance)
export const calculateRprCosts = (propertyAge: number) => {
  const cityComplianceFee = 189 // Fixed municipal fee (City of Calgary charge)
  let surveyFee = 600 // Base fee for newer properties

  if (propertyAge > 15) surveyFee += 200 // Moderate age surcharge
  if (propertyAge > 30) surveyFee += 300 // Significant age surcharge

  // const surveyFee = 600 + (1500 - 600) * 0.5 // Midpoint of [600..1500] range = $1050
  // const surveyFee = 1500
  return surveyFee + cityComplianceFee
}

type ClosingCosts = {
  total: number
  percentage: number
  realtor: number
  legal: number
  rpr: number
  discharge: number
  estoppel: number
}

export const calculateClosingCosts = (
  estimateData: EstimateData | null
): ClosingCosts => {
  const { payload, estimate = 0 } = estimateData || {}

  const currentYear = new Date().getFullYear()
  const propertyAge = currentYear - (payload?.details?.yearBuilt || currentYear)
  // WARN: messy way of detecting wheither the property is a condo or not,
  // instead of parsing details.propertyType
  const condo = Boolean(Object.keys(payload?.condominium || {}).length)

  // Core cost calculations (all values in CAD)
  const costs = {
    realtor: calculateCommission(estimate),
    legal: calculateLegalFees(estimate),
    rpr: calculateRprCosts(propertyAge),
    discharge: 100, // Standard mortgage discharge fee
    estoppel: condo ? 300 : 0 // Average condo fee
  } as ClosingCosts

  // Calculate totals
  costs.total = Object.values(costs).reduce((a, b) => a + b, 0)
  costs.percentage = Number(((costs.total / estimate) * 100).toFixed(1))

  return costs
}
