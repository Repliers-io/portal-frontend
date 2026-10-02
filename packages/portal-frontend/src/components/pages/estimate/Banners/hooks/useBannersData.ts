import { useEstimate } from 'providers/EstimateProvider'
import {
  formatEnglishPrice,
  formatPercentage as _formatPercentage
} from 'utils/formatters'

import { calculateClosingCosts } from '../utils'

const formatPrice = (value: number): string => {
  return formatEnglishPrice(Math.round(value))
}

const formatPercentage = (value: number) => {
  return _formatPercentage(Math.round(value)).replace('+', '')
}

type EquityGainType = 'increase' | 'decrease'

const useBannersData = () => {
  const { estimateData, financialData, editing } = useEstimate()
  const { estimate = 0 } = estimateData || {}

  const mortgage = financialData?.mortgage?.balance || 0
  const purchasePrice = financialData?.purchasePrice || 0

  const closingCosts = calculateClosingCosts(estimateData).total

  const equity = Math.round(estimate - mortgage)

  const equityRate = ((estimate - purchasePrice) / purchasePrice) * 100
  const equityGain: EquityGainType = equityRate > 0 ? 'increase' : 'decrease'

  const calculatedNetEquity = estimate - mortgage - closingCosts

  const blurredMortgageEquity = purchasePrice <= 0 || !editing

  return {
    // Raw values after calculation
    equity,
    equityRate,
    equityGain,
    calculatedNetEquity,
    mortgage,
    purchasePrice,
    closingCosts,

    // Formatted values
    formattedEquity: formatPrice(equity),
    formattedEquityRate: formatPercentage(Math.abs(equityRate)),
    formattedMortgage: formatPrice(mortgage),
    formattedPurchasePrice: formatPrice(purchasePrice),
    formattedClosingCosts: formatPrice(closingCosts),
    formattedCalculatedNetEquity: formatPrice(calculatedNetEquity),

    // blurred state
    blurredMortgageEquity,
    blurredMortgageCalculation: blurredMortgageEquity
  }
}

export default useBannersData
