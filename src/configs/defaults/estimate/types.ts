import { type Path } from 'react-hook-form'

import { type ListingType, listingTypes } from '@configs/filters'

import {
  type ApiAddress,
  type ApiCoordsWithZip,
  type PropertyAddress
} from 'services/API'

const noEstimationTypes = [
  'allListings',
  'business',
  'commercial',
  'land'
] as const

type NoEstimationType = (typeof noEstimationTypes)[number]

export type EstimateListingType = Exclude<ListingType, NoEstimationType>

export type EstimateClass =
  | 'ResidentialProperty'
  | 'CondoProperty'
  | 'CommercialProperty'
  | 'Land'

export const estimateListingTypes = listingTypes.filter(
  (type): type is EstimateListingType =>
    !noEstimationTypes.includes(type as NoEstimationType)
)

export type MortgageFields = {
  balance: number | null
}

export type EstimateDetails = {
  propertyType: string
  basement1: string
  basement2: string
  exteriorConstruction1: string
  exteriorConstruction2: string
  swimmingPool: string
  heating: string
  numBathrooms: number
  numBedrooms: number
  numFireplaces: string
  numGarageSpaces: number
  numParkingSpaces: number
  sqft: number
  style: string
  yearBuilt: number
}

export type EstimatePayload = {
  boardId: number
  resource?: string
  address: Partial<PropertyAddress>
  details: EstimateDetails
  taxes: {
    annualAmount: number
  }
  lot?: {
    depth?: number
    width?: number
    acres?: string
  }
  condominium?: {
    exposure: string
    amenities?: string[]
    fees?: {
      maintenance?: string | number
    }
    pets?: string
  }
  map: {
    latitude: number
    longitude: number
  }
  data?: {
    improvements?: {
      maintenanceSpent?: number
      improvementSpent?: number
      landscapingSpent?: number
    }
    imageUrl?: string
    salesIntentions?: {
      sellingTimeline?: string
    }
    purchasePrice?: number
    purchaseDate?: string
    mortgage?: {
      balance?: number
    }
  }
}

// TODO: maybe better move this type to services/types ???
export type EstimateData = {
  clientId?: number
  estimateId?: number
  ulid?: string
  images?: string[]
  address: Partial<PropertyAddress>
  class: EstimateClass
  condominium?: {
    exposure: string
  }
  propertyType?: string
  details: EstimateDetails
  createdOn?: string
  updatedOn?: string
  lastSendEmailOn?: string // local state for avoiding heavy API calls
  lot: {
    depth: string
    width: string
    acres: string
    measurement: string | null
  }
  taxes: {
    annualAmount: number
  }
  data?: {
    imageUrl?: string
    purchasePrice?: number
    purchaseDate?: string
    improvements?: {
      bedroomsAdded?: {
        year?: string
        count?: number
      }
      bathroomsAdded?: {
        year?: string
        count?: number
      }
      kitchenRenewalYear?: string
    }
  }
  point?: ApiCoordsWithZip
  estimate?: number
  estimateLow?: number
  estimateHigh?: number
  payload?: EstimatePayload
  request?: EstimatePayload
  sendEmailMonthly?: boolean
  // temporary
  history?: any
}

export const intentionsItems = [
  'asap',
  '3months',
  '6months',
  '12months',
  'other'
] as const

export type IntentionsType = (typeof intentionsItems)[number]

export const intentionsMapping: [IntentionsType, string][] = [
  ['asap', 'As soon as possible'],
  ['3months', '1-3 months'],
  ['6months', '3-6 months'],
  ['12months', '6-12 months'],
  ['other', 'Just checking']
]

export type FormValues = {
  address?: ApiAddress
  point?: ApiCoordsWithZip
  unitNumber: string
  boardId: number
  listingType: EstimateListingType
  estimateId?: number
  clientId?: number

  details: {
    extras: string
    propertyType?: string
    numBedrooms: number
    numBathrooms: number
    numParkingSpaces: number
    numGarageSpaces?: number
    numFireplaces?: number
    exteriorConstruction1: string[]
    basement1: string[]
    heating: string[]
    style: string
    sqft?: number
    yearBuilt: string
    swimmingPool: string
  }
  lot?: {
    depth?: string
    width?: string
    acres?: string
    sqft?: number
  }
  condominium?: {
    exposure: string
    amenities: string[]
    pets: string
    fees?: {
      maintenance?: number | null
    }
  }
  taxes: {
    annualAmount?: string
  }
  data?: {
    imageUrl?: string
    salesIntentions: {
      sellingTimeline: IntentionsType | ''
    }
    mortgage?: MortgageFields
    purchasePrice?: number | null
    purchaseDate?: string
  }
  termsAgreement?: boolean
  contact: {
    fname: string
    lname: string
    email: string
    phone: string
    confirmationCode?: string
  }
  sendEmailNow?: boolean
  sendEmailMonthly?: boolean
}

export const stepNames = [
  'address',
  'basicDetails',
  'homeDetails',
  'advancedDetails',
  'intentions',
  'contact',
  'confirmation'
] as const

export type EstimateStepName = (typeof stepNames)[number]

export type FormFields = Path<FormValues>[]

export type StepsConfiguration = Partial<
  Record<
    EstimateStepName,
    {
      title: string
      condoTitle?: string
      validation: FormFields
    }
  >
>
