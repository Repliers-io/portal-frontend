import { type YesNo } from './common'
import { type ApiAddress } from './locations'

export interface ApiEstimateParams {
  boardId?: number
  address: ApiAddress
  condominium: {
    ammenities?: string[]
    exposure?: string
    fees?: {
      cableIncl?: string
      heatIncl?: string
      hydroIncl?: string
      maintenance?: number
      parkingIncl?: string
      taxesIncl?: string
      waterIncl?: string
    }
    parkingType?: string
    pets?: string
    stories?: number
    locker?: YesNo
  }
  details: {
    basement1?: string
    basement2?: string | null
    driveway?: string
    exteriorConstruction1?: string
    exteriorConstruction2?: string | null
    extras: string
    garage?: string
    heating?: string
    numBathrooms: number
    numBathroomsPlus?: number
    numBedrooms: number
    numBedroomsPlus?: string
    numFireplaces?: YesNo
    numGarageSpaces?: number
    numParkingSpaces?: number
    propertyType: string
    sqft: number
    style: string
    swimmingPool?: string
    yearBuilt?: string | number
    den?: YesNo
    patio?: YesNo
  }
  images?: string[]
  lot: { acres?: string; depth?: number; width?: number }
  sendEmailNow?: boolean
  sendEmailMonthly?: boolean
  taxes: {
    annualAmount: number
  }
  ownerHistory?: {
    imageUrl?: string
    purchasePrice?: number
    purchaseDate?: string
    improvements?: {
      maintenanceSpent?: number
      improvementSpent?: number
      landscapingSpent?: number
      kitchenRenewalYear?: string
      bedroomsAdded?: {
        count?: number
        year?: string
      }
      bathroomsAdded?: {
        count?: number
        year?: string
      }
    }
  }
}
