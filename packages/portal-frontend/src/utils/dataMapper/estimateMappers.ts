import { type EstimatePayload } from '@configs/estimate'

import {
  formatDate,
  formatEnglishNumber,
  formatEnglishPrice
} from 'utils/formatters'
import { SQFT_PER_ACRE } from 'utils/numbers'

// Named formatters for the estimate-results "home facts", referenced by name
// from @configs/estimate/homeFacts (mirrors how pdp-sections references mappers).

export const mapperEstimateArrayJoin = (
  _payload: EstimatePayload,
  value?: any
) => (Array.isArray(value) ? value.join(', ') : value)

export const mapperEstimateAnnualTaxes = (
  _payload: EstimatePayload,
  value?: any
) => formatEnglishPrice(Math.round(value))

// "frontage x depth" — default keeps the exact lot input values
export const mapperEstimateLotDimensions = (payload: EstimatePayload) => {
  const { lot } = payload
  return lot?.width && lot?.depth ? `${lot.width} x ${lot.depth}` : null
}

// Rounded variant (movesmartly) — drops the fractional part on the dimensions
export const mapperEstimateLotDimensionsRounded = (
  payload: EstimatePayload
) => {
  const { lot } = payload
  return lot?.width && lot?.depth
    ? `${Math.round(lot.width)} x ${Math.round(lot.depth)}`
    : null
}

// Lot area in sqft from width*depth or acres, rounded to a whole number
export const mapperEstimateLotArea = (payload: EstimatePayload) => {
  const { width, depth, acres } = payload.lot || {}
  const sqft =
    width && depth
      ? width * depth
      : acres
        ? Number(acres) * SQFT_PER_ACRE
        : null
  return sqft != null ? `${formatEnglishNumber(sqft, 0)} sqft` : null
}

export const mapperEstimateInteriorSize = (
  _payload: EstimatePayload,
  value?: any
) => (value ? `${formatEnglishNumber(value, 0)} sqft` : null)

export const mapperEstimateMaintenanceFee = (
  _payload: EstimatePayload,
  value?: any
) => (value ? formatEnglishPrice(Math.round(+value)) : null)

export const mapperEstimatePurchasePrice = (
  _payload: EstimatePayload,
  value?: any
) => (value ? formatEnglishPrice(Math.round(+value)) : null)

export const mapperEstimateMortgageBalance = (
  _payload: EstimatePayload,
  value?: any
) => (value ? formatEnglishPrice(Math.round(+value)) : null)

export const mapperEstimatePurchaseDate = (
  _payload: EstimatePayload,
  value?: any
) => formatDate(value)
