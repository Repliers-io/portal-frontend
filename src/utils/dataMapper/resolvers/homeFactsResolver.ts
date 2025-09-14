import { type EstimatePayload } from '@configs/estimate'

import {
  formatDate,
  formatEnglishNumber,
  formatEnglishPrice
} from 'utils/formatters'
import { SQFT_PER_ACRE } from 'utils/numbers'

import type { ResolverItem } from '../types'
import { isEmptyValue } from '../utils'

import createResolver from './createResolver'

const arrayFormatter = (property: EstimatePayload, value?: any) => {
  return Array.isArray(value) ? value.join(', ') : value
}

const formatters = {
  annualPropertyTaxes: (property: EstimatePayload, value?: any) => {
    return formatEnglishPrice(Math.round(value))
  },
  lotSize: (property: EstimatePayload) => {
    const { lot } = property
    return lot?.width && lot?.depth ? `${lot.width} x ${lot.depth}` : null
  },
  approximateLotSize: (property: EstimatePayload) => {
    const { lot } = property
    const { width, depth, acres } = lot || {}
    return width && depth
      ? `${formatEnglishNumber(width * depth)} sqft`
      : acres
        ? `${formatEnglishNumber(Number(acres) * SQFT_PER_ACRE)} sqft`
        : null
  },
  approximateInteriorSize: (property: EstimatePayload, value?: any) => {
    return value ? `${formatEnglishNumber(value)} sqft` : null
  },
  maintenanceFee: (property: EstimatePayload, value?: any) => {
    return value ? formatEnglishPrice(Math.round(+value)) : null
  },
  purchasePrice: (property: EstimatePayload, value?: any) => {
    return value ? formatEnglishPrice(Math.round(+value)) : null
  },
  mortgageBalance: (property: EstimatePayload, value?: any) => {
    return value ? formatEnglishPrice(Math.round(+value)) : null
  }
}

const propertyDefinitions: ResolverItem[] = [
  { label: 'Style', path: 'details.propertyType' },
  { label: 'Style of Home', path: 'details.style' },
  { label: 'Bedrooms', path: 'details.numBedrooms' },
  { label: 'Bathrooms', path: 'details.numBathrooms' },
  { label: 'Garage Spaces', path: 'details.numGarageSpaces' },
  { label: 'Parking Spaces', path: 'details.numParkingSpaces' },
  {
    label: 'Exterior',
    path: 'details.exteriorConstruction1',
    fn: arrayFormatter
  },
  {
    label: 'Annual Property Taxes',
    path: 'taxes.annualAmount',
    fn: formatters.annualPropertyTaxes
  },
  { label: 'Year Built', path: 'details.yearBuilt' },
  { label: 'Lot Size (Feet)', fn: formatters.lotSize },
  { label: 'Lot Area', fn: formatters.approximateLotSize },
  {
    label: 'Square Footage',
    path: 'details.sqft',
    fn: formatters.approximateInteriorSize
  },
  { label: 'Basement Details', path: 'details.basement1', fn: arrayFormatter },
  { label: 'Heating', path: 'details.heating', fn: arrayFormatter },
  { label: 'Swimming Pool', path: 'details.swimmingPool' },
  { label: 'Exposure', path: 'condominium.exposure' },
  { label: 'Amenities', path: 'condominium.amenities', fn: arrayFormatter },
  {
    label: 'Maintenance Fee',
    path: 'condominium.fees.maintenance',
    fn: formatters.maintenanceFee
  },
  { label: 'Pets', path: 'condominium.pets' },
  { label: 'Extras', path: 'details.extras', fn: arrayFormatter },

  {
    label: 'Purchase price',
    path: 'data.purchasePrice',
    fn: formatters.purchasePrice
  },
  {
    label: 'Purchase date',
    path: 'data.purchaseDate',
    fn: (property: EstimatePayload, value?: any) => formatDate(value)
  },
  {
    label: 'Mortgage balance',
    path: 'data.mortgage.balance',
    fn: formatters.mortgageBalance
  }
] as ResolverItem[]

const visibleFields = (properties: ResolverItem[], hidden: string[] = []) =>
  properties.filter(({ path }) => !hidden.includes(path!))

const homeFactsResolver = (
  payload: EstimatePayload,
  hiddenFields: string[] = []
) => {
  const fields = visibleFields(propertyDefinitions, hiddenFields)
  const properties = createResolver(fields, payload as any)

  return properties.filter((property) => !isEmptyValue(property.value))
}

export default homeFactsResolver
