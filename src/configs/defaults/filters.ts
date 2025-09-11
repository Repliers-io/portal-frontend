import {
  type ApiQueryParamsAllowedFields,
  type Property,
  type PropertyInsightFeature,
  type QualitativeInsightValue
} from 'services/API'
import { type Filters } from 'services/Search'

export const listingStatuses = ['active', 'sold', 'all', 'rent'] as const

export type ListingStatus = (typeof listingStatuses)[number]

export const listingTypes = [
  'allListings',
  'residential',
  'condo',
  'townhome',
  'semiDetached',
  'multiFamily',
  'land',
  'business',
  'commercial'
] as const

export type ListingType = (typeof listingTypes)[number]

export type ListingFields = keyof Property | ApiQueryParamsAllowedFields

export const listingFields: Array<ListingFields> = [
  'mlsNumber',
  'status',
  'class',
  'listPrice',
  'listDate',
  'lastStatus',
  'soldPrice',
  'soldDate',
  'address',
  'map',
  'images',
  'imagesScore',
  'imageInsights',
  'details.numBathrooms',
  'details.numBathroomsPlus',
  'details.numBedrooms',
  'details.numBedroomsPlus',
  'details.propertyType',
  'details.sqft',
  'details.style',
  'lot',
  'updatedOn',
  'daysOnMarket',
  'boardId'
]

export type PropertyClass = 'residential' | 'condo' | 'commercial' | 'all'

export const aiQuality = [
  ['Excellent', 'excellent'],
  ['Good', 'above average'],
  ['Average', 'average'],
  ['Fair', 'below average'],
  ['Poor', 'poor']
] as [string, QualitativeInsightValue][]

export const aiQualityFeatureNames: Partial<
  Record<PropertyInsightFeature, string>
> = {
  frontOfStructure: 'Front View'
}

export const defaultFilters: Filters = {
  listingStatus: 'active',
  listingType: 'allListings',
  sortBy: 'listPriceDesc'
}

export const defaultAdvancedFilters: Filters = {
  minBeds: 0,
  minBaths: 0,
  minGarageSpaces: 0,
  minParkingSpaces: 0,
  minPrice: 0,
  maxPrice: 0,
  minYearBuilt: null,
  maxYearBuilt: null,
  daysOnMarket: 'any',
  soldWithin: 'any',
  overallQuality: null,
  livingRoomQuality: null,
  diningRoomQuality: null,
  kitchenQuality: null,
  bedroomQuality: null,
  bathroomQuality: null,
  frontOfStructureQuality: null
}

export const priceBuckets = {
  sale: [
    { from: 1000000, steps: 2 },
    { from: 1600000, steps: 4 },
    { from: 2400000, steps: 6 },
    { from: 3000000, steps: 10 }
  ],
  rent: [
    { from: 4000, steps: 2 },
    { from: 6000, steps: 4 }
  ]
}
