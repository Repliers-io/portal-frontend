import { type ApiSavedSearch } from 'services/API'

export const defaultMinPrice = 1
export const defaultMaxPrice = 500_000_000

export const notifications = ['monthly', 'weekly', 'daily', 'instant'] as const

export const keysToPick: (keyof ApiSavedSearch)[] = [
  'type',
  'class',
  'propertyTypes',
  'minBeds',
  'minBaths',
  'minPrice',
  'maxPrice',
  'minGarageSpaces',
  'minParkingSpaces',
  'soldNotifications',
  'minYearBuilt',
  'maxYearBuilt',
  'maxMaintenanceFee',
  'minSqft',
  'maxSqft',
  'minLotSizeSqft',
  'maxLotSizeSqft',
  'minLotWidth',
  'maxLotWidth',
  'styles', // remapped to `style` on read (see getFiltersFromSavedSearch)
  'basement',
  'keywords'
]

export const places = [
  {
    minZoom: 16.5,
    types: ['address', 'neighborhood', 'locality', 'place', 'region']
  },
  {
    minZoom: 14,
    types: ['neighborhood', 'locality', 'place', 'region']
  },
  { minZoom: 12, types: ['locality', 'place', 'region'] },
  { minZoom: 8, types: ['place', 'region'] }
]
