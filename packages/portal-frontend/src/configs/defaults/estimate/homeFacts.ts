import {
  mapperEstimateAnnualTaxes,
  mapperEstimateArrayJoin,
  mapperEstimateInteriorSize,
  mapperEstimateLotArea,
  mapperEstimateLotDimensions,
  mapperEstimateMaintenanceFee,
  mapperEstimateMortgageBalance,
  mapperEstimatePurchaseDate,
  mapperEstimatePurchasePrice
} from 'utils/dataMapper/estimateMappers'
import { type EstimateResolverItem } from 'utils/dataMapper/types'

// Estimate-results "Home Facts" field definitions — the config-driven, tenant
// overridable counterpart of @configs/pdp-sections. `label` values are i18n keys
// resolved against the `Estimates.homeFacts` namespace in PropertyList (urbn
// relabels maintenanceFee -> "HOA Dues"). Visual order stays in the component.
// Base iteration is a flat list; groups/sections can be layered on later.
export const homeFactsFields: EstimateResolverItem[] = [
  { label: 'style', path: 'details.propertyType' },
  { label: 'styleOfHome', path: 'details.style' },
  { label: 'bedrooms', path: 'details.numBedrooms' },
  { label: 'bathrooms', path: 'details.numBathrooms' },
  { label: 'garageSpaces', path: 'details.numGarageSpaces' },
  { label: 'parkingSpaces', path: 'details.numParkingSpaces' },
  {
    label: 'exterior',
    path: 'details.exteriorConstruction1',
    fn: mapperEstimateArrayJoin
  },
  {
    label: 'annualPropertyTaxes',
    path: 'taxes.annualAmount',
    fn: mapperEstimateAnnualTaxes
  },
  { label: 'yearBuilt', path: 'details.yearBuilt' },
  { label: 'lotSizeFeet', fn: mapperEstimateLotDimensions },
  { label: 'lotArea', fn: mapperEstimateLotArea },
  {
    label: 'squareFootage',
    path: 'details.sqft',
    fn: mapperEstimateInteriorSize
  },
  {
    label: 'basementDetails',
    path: 'details.basement1',
    fn: mapperEstimateArrayJoin
  },
  { label: 'heating', path: 'details.heating', fn: mapperEstimateArrayJoin },
  { label: 'swimmingPool', path: 'details.swimmingPool' },
  { label: 'exposure', path: 'condominium.exposure' },
  {
    label: 'amenities',
    path: 'condominium.amenities',
    fn: mapperEstimateArrayJoin
  },
  {
    label: 'maintenanceFee',
    path: 'condominium.fees.maintenance',
    fn: mapperEstimateMaintenanceFee
  },
  { label: 'pets', path: 'condominium.pets' },
  { label: 'extras', path: 'details.extras', fn: mapperEstimateArrayJoin },
  {
    label: 'purchasePrice',
    path: 'data.purchasePrice',
    fn: mapperEstimatePurchasePrice
  },
  {
    label: 'purchaseDate',
    path: 'data.purchaseDate',
    fn: mapperEstimatePurchaseDate
  },
  {
    label: 'mortgageBalance',
    path: 'data.mortgage.balance',
    fn: mapperEstimateMortgageBalance
  }
]
