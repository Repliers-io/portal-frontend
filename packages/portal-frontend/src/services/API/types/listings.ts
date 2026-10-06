import { type ApiClassResponse, type ApiCoords, type YesNo } from './common'
import { type ApiLocation } from './locations'

export type ApiLastStatus =
  | 'Sus'
  | 'Exp'
  | 'Sld'
  | 'Ter'
  | 'Dft'
  | 'Lsd'
  | 'Sc'
  | 'Sce'
  | 'Lc'
  | 'Lce'
  | 'Pc'
  | 'Ext'
  | 'New'
  | 'Cs'

// Shorthand for the lastStatus lifecycle groups: sale, rent, sold, inactive
export type ListingStatusGroup = 'sale' | 'rent' | 'sold' | 'inactive'

export type ApiSimilarSortBy =
  | 'createdOnAsc'
  | 'createdOnDesc'
  | 'updatedOnDesc'
  | 'updatedOnAsc'

interface ApiCondominiumFees {
  cableInlc: string | null
  heatIncl: string | null
  hydroIncl: string | null
  maintenance: string | null
  parkingIncl: string | null
  taxesIncl: string | null
  waterIncl: string | null

  [key: string]: string | null
}

export interface ApiCondominium {
  ammenities: string[]
  amenities?: string[]
  buildingInsurance: string | null
  condoCorp: string | null
  condoCorpNum: string | null
  exposure: string
  lockerNumber: string
  locker: string
  parkingType: string | null
  pets: string
  propertyMgr: string | null
  stories: string | null
  fees: ApiCondominiumFees
  maintenance?: string | null
  ensuiteLaundry?: string
}

export interface ApiListingDetails {
  airConditioning: string
  basement1: string
  basement2: string
  centralAirConditioning: string
  centralVac: null
  den: null
  description: string
  driveway: string
  elevator: null
  exteriorConstruction1: string
  exteriorConstruction2: null
  extras: string
  furnished: null
  garage: null
  heating: string
  numBathrooms: string
  numBathroomsPlus: string
  numBedrooms: string
  numBedroomsPlus: string
  numDrivewaySpaces: string
  numFireplaces: string
  numGarageSpaces: string
  numKitchens: string
  numParkingSpaces: string
  numRooms: null
  numRoomsPlus: null
  patio: null
  propertyType: string
  sqft: string
  style: string
  swimmingPool: string
  virtualTourUrl: string
  // Second media link the MLS carries alongside virtualTourUrl — often a video
  // when the primary is a 3D tour (or vice versa). Both are classified by host.
  alternateURLVideoLink: string
  yearBuilt: string
  flooringType: string
  fireProtection: string
  foundationType: string
  waterSource: string | null
  sewer: string | null
  landscapeFeatures: string
  zoningDescription: string | null
  zoning: string
  zoningType: string | null
}

interface ApiLot {
  acres?: number | null
  depth: number
  irregular: string
  legalDescription: null | string
  measurement: null
  width: number
  size?: number | null
}

export interface ApiListingAddress {
  area: string
  city: string
  country: string
  district: string
  majorIntersection: string
  neighborhood: string
  streetDirection: string
  streetName: string
  streetNumber: string
  streetSuffix: string
  unitNumber?: string
  zip: string
  state: string
  communityCode?: string
  streetDirectionPrefix?: string
}

interface ApiOpenHouse {
  date: string
  startTime: string
  endTime: string
  type?: string | null
  status?: string | null
  TZ?: string
}

export interface ApiRooms {
  [key: number]: {
    description: string
    features: string
    features2: string
    features3: string
    length: string
    width: string
    level: string
  }
}

interface ApiTimestamps {
  idxUpdated: null
  listingUpdated: string
  photosUpdated: string
  repliersUpdatedOn: string
  conditionalExpiryDate: null
  terminatedDate: null
  suspendedDate: null
  listingEntryDate: string
  closedDate: string | null
  unavailableDate: null
  expiryDate: null
  extensionEntryDate: null
}

interface ApiListingAgentAddress {
  address1: string
  address2: string
  city: string
  state: string
  postal: string
  country: string
}

interface ApiListingAgent {
  agentId: number
  boardAgentId: string
  updatedOn: string
  name: string
  board: string
  position: string
  email?: string
  phones: number[]
  social: string[]
  website: string
  photo: {
    small: string
    large: string
    updatedOn: string
  }
  brokerage: {
    name: string
    address: ApiListingAgentAddress
  }
}

export interface PropertyEstimate {
  low: number
  high: number
  date: string
  value: number
  confidence: number
  history: {
    mth: {
      [month: string]: {
        value: number
      }
    }
  }
}

export interface HistoryItemType {
  lastStatus: ApiLastStatus
  listDate: string
  listPrice: number | string
  mlsNumber: string
  /** Present on records from the property history endpoint; absent on detail-embedded ones. */
  boardId?: number
  office: { brokerageName: string }
  soldDate: string | null
  soldPrice: number | null
  timestamps: {
    expiryDate: null | string
    terminatedDate: null | string
    listingEntryDate: null | string
    closedDate: null | string
    idxUpdated: null | string
    unavailableDate?: null | string
  }
  type: string
  images: string[]
}

export interface ApiListingHistoryResponse {
  history: HistoryItemType[]
}

export const propertyInsightFeatures = [
  'bedroom',
  'bathroom',
  'livingRoom',
  'diningRoom',
  'kitchen',
  'frontOfStructure'
] as const

export const qualitativeInsightValues = [
  'excellent',
  'above average',
  'average',
  'below average',
  'poor'
] as const

export type PropertyInsightFeature = (typeof propertyInsightFeatures)[number]

export type QualitativeInsightValue = (typeof qualitativeInsightValues)[number]

export interface PropertySummaryInsights {
  quality: {
    qualitative: {
      features: Record<PropertyInsightFeature, QualitativeInsightValue>
      overall: QualitativeInsightValue
    }
    quantitative: {
      features: Record<PropertyInsightFeature, number>
      overall: number
    }
  }
}

export interface PropertyImageInsights {
  image: string
  classification: {
    imageOf: string
    prediction: number
  }
  quality: {
    qualitative: QualitativeInsightValue
    quantitative: number
  } | null
}

export interface PropertyInsights {
  summary: PropertySummaryInsights
  images: PropertyImageInsights[]
}

export interface ApiListing {
  boardId: number
  // Internal board ids where the same MLS number also exists (e.g. the VOW
  // board alongside the IDX board). Used to retarget cards to the richer board.
  duplicates?: number[]
  mlsNumber: string
  status: string
  class: ApiClassResponse
  type: string
  listPrice: string
  daysOnMarket: string
  // Repliers' live "today − listDate" DOM; use for active listings (daysOnMarket
  // reflects the MLS feed and can lag behind updatedOn).
  simpleDaysOnMarket: number
  occupancy: string
  listDate: string
  updatedOn: string
  lastStatus: ApiLastStatus
  soldPrice: string
  soldDate: null
  originalPrice: string
  address: ApiListingAddress
  condominium: ApiCondominium
  details: ApiListingDetails
  estimate?: PropertyEstimate
  history?: HistoryItemType[]
  lot: ApiLot
  map: ApiCoords
  nearby: {
    ammenities: string[]
    amenities?: string[]
  }
  office: {
    brokerageName: string
  }
  openHouse: Record<string, ApiOpenHouse> | ApiOpenHouse[]
  permissions: {
    displayAddressOnInternet: YesNo
    displayInternetEntireListing: YesNo
    displayPublic: YesNo
    displayOnMap: YesNo
  }
  rooms: ApiRooms
  taxes: {
    annualAmount: number
    assessmentYear: number
  }
  timestamps: ApiTimestamps
  images?: string[]
  imagesScore?: number[]
  // Key of the photo an AI parameter matched, set client-side by
  // `markMatchedImage`. Never returned by the API.
  matchedImage?: string
  imageInsights?: PropertyInsights
  agents: ApiListingAgent[]
  locations?: ApiLocation[]
  comparables?: ApiListing[]
  favoriteId?: string
  raw?: {
    [key: string]: string
  }
}

export interface ApiSimilarRequest {
  boardId?: number
  listPriceRange?: number
  radius?: number
  sortBy?: ApiSimilarSortBy
}

export interface ApiSimilarResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  similar: ApiListing[]
}
