import { type Position } from 'geojson'

import { type EstimateData } from '@configs/estimate'

export type ApiClass = 'condo' | 'residential' | 'commercial'

export type ApiClassResponse =
  | 'CommercialProperty'
  | 'ResidentialProperty'
  | 'CondoProperty'

export type ApiSortBy =
  | 'createdOnAsc'
  | 'createdOnDesc'
  | 'updatedOnAsc'
  | 'updatedOnDesc'
  | 'listPriceAsc'
  | 'listPriceDesc'
  | 'random'
  | 'soldDateAsc'
  | 'soldDateDesc'
  | 'soldPriceAsc'
  | 'soldPriceDesc'
  | 'distanceAsc'
  | 'distanceDes'
  | 'qualityAsc'
  | 'qualityDesc'

export type ApiSimilarSortBy =
  | 'createdOnAsc'
  | 'createdOnDesc'
  | 'updatedOnDesc'
  | 'updatedOnAsc'

export type ApiLastStatus =
  | 'Sus'
  | 'Exp'
  | 'Sld'
  | 'Ter'
  | 'Dft'
  | 'Lsd'
  | 'Sc'
  | 'Lc'
  | 'Pc'
  | 'Ext'
  | 'New'

export interface ApiCondominiumFees {
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

export interface PropertyDetails {
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
  numFireplaces: string
  numGarageSpaces: string
  numParkingSpaces: string
  numRooms: null
  numRoomsPlus: null
  patio: null
  propertyType: string
  sqft: string
  style: string
  swimmingPool: string
  virtualTourUrl: string
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

export interface ApiLot {
  acres?: number | null
  depth: number
  irregular: string
  legalDescription: null | string
  measurement: null
  width: number
  size?: number | null
}

export interface PropertyAddress {
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

export interface ApiCoords {
  latitude: number
  longitude: number
}

// Coordinates type that includes zip code from Google Places API
export type ApiCoordsWithZip = ApiCoords & {
  zip?: string
}

export interface ApiOpenHouse {
  [key: number]: {
    date: null
    endTime: null
    startTime: null
  }
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

export interface ApiTimestamps {
  idxUpdated: null
  listingUpdated: string
  photosUpdated: string
  conditionalExpiryDate: null
  terminatedDate: null
  suspendedDate: null
  listingEntryDate: string
  closedDate: null
  unavailableDate: null
  expiryDate: null
  extensionEntryDate: null
}

interface ApiAgentAddress {
  address1: string
  address2: string
  city: string
  state: string
  postal: string
  country: string
}

export interface ApiAgent {
  agentId: number
  boardAgentId: string
  updatedOn: string
  name: string
  board: string
  position: string
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
    address: ApiAgentAddress
  }
}

export interface ApiResponseError {
  error: string
}

export type ListingLastStatus =
  | 'Sus'
  | 'Exp'
  | 'Sld'
  | 'Ter'
  | 'Dft'
  | 'Lsd'
  | 'Sc'
  | 'Sce'
  | 'Lc'
  | 'Pc'
  | 'Ext'
  | 'New'

export const listingLastStatusMapping: Record<ListingLastStatus, string> = {
  Sus: 'Suspended',
  Exp: 'Expired',
  Sld: 'Sold',
  Ter: 'Terminated',
  Dft: 'Deal Fell Through',
  Lsd: 'Leased',
  Sc: 'Sold Conditionally',
  Sce: 'Sold Conditionally with Escape Clause (rare)',
  Lc: 'Leased Conditionally',
  Pc: 'Price Change',
  Ext: 'Extension',
  New: 'New'
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
  lastStatus: ListingLastStatus
  listDate: string
  listPrice: number | string
  mlsNumber: string
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

export interface Property {
  boardId: number
  mlsNumber: string
  status: string
  class: ApiClassResponse
  type: string
  listPrice: string
  daysOnMarket: string
  occupancy: string
  listDate: string
  updatedOn: string
  lastStatus: ListingLastStatus
  soldPrice: string
  soldDate: null
  originalPrice: string
  address: PropertyAddress
  condominium: ApiCondominium
  details: PropertyDetails
  estimate?: PropertyEstimate
  history?: HistoryItemType[]
  lot: ApiLot
  map: ApiCoords
  nearby: {
    ammenities: string[]
  }
  office: {
    brokerageName: string
  }
  openHouse: ApiOpenHouse
  permissions: {
    displayAddressOnInternet: 'Y' | 'N'
    displayPublic: 'Y' | 'N'
    displayInternetEntireListing: 'Y' | 'N'
  }
  rooms: ApiRooms
  taxes: {
    annualAmount: number
    assessmentYear: number
  }
  timestamps: ApiTimestamps
  images: string[]
  imagesScore?: number[]
  startImage?: number
  imageInsights?: PropertyInsights
  agents: ApiAgent[]
  comparables?: Property[]
  favoriteId?: string
  raw?: {
    [key: string]: string
  }
}

export type ApiClusterMapCoords = [number, number][][]

export interface ApiClusterLocation extends ApiCoords {
  map: ApiClusterMapCoords
}

export interface ApiBounds {
  top_left: ApiCoords
  bottom_right: ApiCoords
}

export interface ApiCluster {
  bounds: ApiBounds
  count: number
  location: ApiClusterLocation
  map: ApiClusterMapCoords
}

export type ApiQueryParamsAllowedFields =
  | 'details.numBathrooms'
  | 'details.numBathroomsPlus'
  | 'details.numBedrooms'
  | 'details.numBedroomsPlus'
  | 'details.propertyType'
  | 'details.sqft'
  | 'details.style'

export type ApiStatus = 'A' | 'U'

type ApiImageSearchItem = {
  value?: string
  url?: string
  type: 'text' | 'image'
  boost: number
}

export interface ApiQueryParams {
  mlsNumber: string
  area: string | string[]
  city: string | string[]
  neighborhood: string | string[]
  minPrice?: number
  maxPrice?: number
  streetNumber: string
  streetName: string
  propertyType: string | string[]
  style: string[]
  minBeds: number
  maxBeds: number
  class: ApiClass | ApiClass[]
  listDate: string
  updatedOn: string

  sortBy: ApiSortBy // default: 'createdOnDesc'
  pageNum: number
  resultsPerPage: number
  type: 'sale' | 'lease'
  map: string
  minBaths: number
  maxBaths: number
  boardId: number
  status: ApiStatus | ApiStatus[]
  lastStatus: ApiLastStatus | ApiLastStatus[]
  minSoldPrice: string
  maxSoldPrice: string
  minSoldDate: string
  maxSoldDate: string
  minListDate: string
  statistics: string

  // operator - default: 'AND'
  operator: 'AND' | 'OR'

  // condition - default: 'EXACT'
  condition: 'EXACT' | 'CONTAINS'
  keywords: string
  hasImages: boolean
  displayAddressOnInternet: 'Y' | 'N'
  displayPublic: 'Y' | 'N'
  minSqft: number
  minParkingSpaces: number

  dtype: number

  search: string
  searchFields: string

  aggregates: string
  clusterFields: string
  clusterPrecision: number
  clusterLimit: number

  listings: boolean

  lat: string
  long: string
  radius: number // in KM
  fields: string
  imageSearchItems: ApiImageSearchItem[]
}

export interface ApiAggregates {
  map: {
    clusters: ApiCluster[]
  }
  listPrice?: {
    lease: {
      [range: string]: number
    }
    sale: {
      [range: string]: number
    }
  }
}

export interface ApiStatisticRecord {
  avg: number
  med: number
  count: number
  sum: number
}

export interface ApiStatistic {
  avg: number
  med: number
  mth: { [date: string]: ApiStatisticRecord }
}

export interface ApiQueryResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  statistics: {
    listPrice?: {
      min: string
      max: string
    }
    soldPrice?: ApiStatistic
    daysOnMarket?: ApiStatistic
  }
  listings: Property[]
  aggregates?: ApiAggregates
}

export interface ApiV2QueryResponse {
  types: {
    [type: number]: ApiQueryResponse
  }
}

export interface BuildingMetadataAPIV2QueryResponse {
  types: {
    [type: number]: Property[]
  }
}

export interface ApiLocation {
  lat: number
  lng: number
}

export interface ApiNeighborhood {
  name: string
  activeCount: number
  location: ApiLocation
  coordinates?: Position[][]
}

export interface ApiBoardCity {
  name: string
  activeCount: number
  location: ApiLocation
  state: string
  coordinates?: Position[][]
  neighborhoods?: ApiNeighborhood[]
}

export interface ApiBoardArea {
  name: string
  cities: ApiBoardCity[]
}

export interface ApiBoardClass {
  name: ApiClass
  areas: ApiBoardArea[]
}
export interface ApiBoard {
  boardId: number
  name: string
  updatedOn: string
  classes: ApiBoardClass[]
}

export interface ApiLocations {
  boards: ApiBoard[]
}

export interface AddressRequest {
  requestedMls: string
  streetName: string
  streetNumber: string
  city: string
}

export interface AddressMetadata {
  requestedMls: string
  streetName: string
  streetNumber: string
  city?: string
  count: number
  mlsNumbers: string[]

  requestTime?: number
}

export interface TypedAddressMetadata {
  count: number
  mlsNumbers: string[]
}

export interface TypedAddressBaseMetadata {
  requestedMls: string
  streetName: string
  streetNumber: string
  city: string
  requestTime?: number

  types: {
    [type: number]: TypedAddressMetadata
  }
}

type AutocompleteViewTypeRecent = 'RECENT'
type AutocompleteViewTypeSearch = 'SEARCH'
export type AutocompleteViewType =
  | AutocompleteViewTypeRecent
  | AutocompleteViewTypeSearch

export interface ApiLocationsByIp {
  current: {
    name?: string
    location: {
      lat?: number
      lng?: number
    }
  }
  locations: (ApiBoardCity | ApiNeighborhood)[]
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
  similar: Property[]
}

// TODO: Describe API types here. Divide into modules/sections if needed.
export enum ResultsGridMode {
  Search = 'Search',
  MultiUnit = 'MultiUnit'
}

export interface ApiAutosuggestionParams {
  q: string
  resultsPerPage?: string
  lat?: number
  long?: number
  mapbox_session?: string
}

// Mapbox types
export interface MapboxAddress {
  name: string
  mapbox_id: string
  feature_type: string
  region: {
    region_code: string
  }
  postcode: {
    name: string
  }
  place: {
    name: string
  }
  neighborhood: {
    name: string
  }
}

export interface MapboxSuggestResponse {
  suggestions: MapboxAddress[]
}

export interface MapboxAutosuggestions {
  mapbox: MapboxAddress[]
  listings: ApiQueryResponse
}

// Type for render items in Dropdown. AutosuggestionSourceType - for selectable items. Group - for separators.
export type AutosuggestionSourceType =
  | 'city'
  | 'neighborhood'
  | 'address'
  | 'listing'
  | 'loader'

export type AutosuggestionOptionType = 'group' | AutosuggestionSourceType

// Data Source - extract from responses or search results.
export type AutosuggestionOptionSource =
  | { name: string }
  | ApiBoardCity
  | ApiNeighborhood
  | MapboxAddress
  | Property

export interface AutosuggestionGroupTitle {
  name: string
  type: Extract<AutosuggestionOptionType, 'group'>
}

export interface AutosuggestionLoader {
  type: Extract<AutosuggestionOptionType, 'loader'>
}

export interface AutosuggestionOption {
  type: AutosuggestionSourceType
  class?: ApiClass
  source?: AutosuggestionOptionSource
  parent?: AutosuggestionOptionSource
}

// Auth
export interface ApiUserProfile {
  clientId: number
  agentId: number | null
  fname: string
  lname: string
  phone: string | null
  email: string
  proxyEmail: string
  status: boolean
  lastActivity: string | null
  tags: string[] | null
  communities: string[]
  preferences: {
    email: boolean
    sms: boolean
    unsubscribe?: boolean
    whatsapp?: boolean
  }
  expiryDate: string | null
  searches: string[]
  createdOn: string
  externalId: string
}

export type AuthProvider = 'google' | 'facebook' | 'otp'

export interface AuthResponse {
  url: string
}

export interface LogoutResponse {
  message: string
}

export interface AuthCallbackRequest {
  code: string
}

export interface RefreshResponse {
  token: string
}

export interface AuthCallbackResponse {
  profile: ApiUserProfile
  token: string | undefined
}

export interface ApiFavoritesRequest {
  page: number
  numPages: number
  pageSize: number
  count: number
  favorites: Property[]
}

export interface ApiAddToFavoritesRequest {
  favoriteId: string
}

export type SavedSearchNotificationFrequency =
  | 'instant'
  | 'daily'
  | 'weekly'
  | 'monthly'

export interface ApiSavedSearch {
  searchId: number
  clientId: number
  name: string
  streetNumbers: string[]
  streetNames: string[]
  minBeds?: number
  maxBeds?: number
  maxMaintenanceFee: number
  minBaths?: number
  maxBaths?: number
  areas: string[]
  cities: string[]
  neighborhoods: string[]
  notificationFrequency: SavedSearchNotificationFrequency
  maxPrice?: number
  minPrice?: number
  minYearBuilt?: number
  maxYearBuilt?: number
  propertyTypes: string[]
  styles: string[]
  map: Position[][]
  status: boolean
  type: 'sale' | 'lease'
  class: ApiClass[]
  minGarageSpaces: number
  minKitchens: number
  minParkingSpaces: number
  basement: string[]
  soldNotifications: boolean
  priceChangeNotifications: boolean
  sewer: string[]
  heating: string[]
  swimmingPool: string[]
  waterSource: string[]
}

// Saved searches V2 - add extra fields when needed
export interface ApiSavedSearchCreateRequest {
  clientId: number
  minPrice: number
  maxPrice: number
  type: 'sale' | 'lease'
  class: ApiClass[]

  map?: [number, number][][]
  name?: string
  streetNumbers?: Array<string>
  streetNames?: Array<string>
  minBeds?: number
  minBaths?: number
  propertyTypes?: string[]
  styles?: string[]
  status?: boolean
  minGarageSpaces?: number
  minParkingSpaces?: number
  soldNotifications?: boolean
  notificationFrequency?: SavedSearchNotificationFrequency
}

export interface ApiSavedSearchUpdateRequest
  extends ApiSavedSearchCreateRequest {
  searchId: number
}

export interface ApiSavedSearchRequest {
  page: number
  numPages: number
  pageSize: number
  count: number
  searches: ApiSavedSearch[]
}

export interface ApiAddress {
  country: string
  region: string
  zip: string
  city: string
  streetNumber: string
  streetName: string
  streetSuffix: string
  streetSuffixFull?: string
  streetDirection: string
  fullAddress: string
  address: string
  neighborhood: string
  mapbox_id?: string
  google_place_id?: string
  unitNumber?: string
}

export type YesNo = 'Y' | 'N'

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

export interface SignUpRequest {
  fname: string
  lname: string
  email: string
  phone?: string
}

export interface LogInRequest {
  email?: string
  phone?: string
}

export interface RepliersError {
  info: {
    msg: string
    param?: string
  }[]
  message?: string
}

export interface ErrorCause {
  cause: RepliersError
}

export type NeighborhoodsRankingSorting =
  | 'gainHighToLow'
  | 'gainLowToHigh'
  | 'avgHighToLow'
  | 'avgLowToHigh'

export type ApiFubAddress = Partial<{
  city: string
  code: string
  country: string
  state: string
  street: string
  type: string
}>

export interface ApiClientAgent {
  status: boolean
  agentId: number
  fname: string
  lname: string
  phone: string
  email: string
  proxyPhone: string
  proxyEmail: string
  avatar: string | null
  brokerage: string
  designation: string
  location: ApiCoords | null
  externalId: string | null
  data: Record<string, unknown> | null
}

export interface ApiClient extends ApiUserProfile {
  estimates?: EstimateData[]
  data?: {
    fub?: {
      addresses?: ApiFubAddress[]
    }
  }
}
export interface ApiClientResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  clients: ApiClient[]
}

export interface ApiClientFilterParams {
  clientId?: number
  s?: string // signature param
  pageNum?: number
  resultsPerPage?: number
  email?: string
  fname?: string
  lname?: string
  keywords?: string
  phone?: string
  showEstimates?: boolean
}

export interface ApiClientEstimateResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  estimates: EstimateData[]
}

export interface ApiMessage {
  sender: 'agent' | 'client'
  agentId: number
  clientId: number
  content: Partial<{
    listings: string[]
    searches: number[]
    message: string
    links: string[]
    pictures: string[]
  }>
  messageId: number
  source: 'bot' | string
  token: string
  delivery: {
    scheduleDateTime: string | null
    sentDateTime: string
    status: 'sent' | 'pending'
  }
}

export interface ApiMessageResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  messages: ApiMessage[]
}

type PeriodValue = {
  value: number
}

type StatisticAvgMed = Pick<ApiStatisticRecord, 'avg' | 'med'>

interface PeriodBase<T> {
  month: T
  threeMonth: T
  year: T
}

interface MonthlyRecord<T> {
  [month: string]: T
}

type VolumePeriod = PeriodBase<PeriodValue>
type StatisticPeriod = PeriodBase<StatisticAvgMed> & {
  mth: MonthlyRecord<StatisticAvgMed>
}
type CountPeriod = PeriodBase<PeriodValue> & {
  mth: MonthlyRecord<PeriodValue>
}

export interface ApiWidgetStatistics {
  sold: {
    prices: StatisticPeriod
    volume: VolumePeriod
    count: CountPeriod
    dom: StatisticPeriod
  }
  active: {
    count: PeriodValue
  }
  new: {
    count: {
      mth: MonthlyRecord<PeriodValue>
    }
  }
}

export interface ApiStatisticResponse {
  city: string
  neighborhood?: string
  community?: string
  class: ApiClass
  widgets: ApiWidgetStatistics
}

export interface ApiRplAgent {
  status: boolean
  agentId: number
  fname: string
  lname: string
  phone: string
  email: string
  proxyPhone: string
  proxyEmail: string
  avatar?: string | null
  brokerage: string
  designation: string
  location?: ApiLocation | null
  externalId?: string | null
  data?: Record<string, unknown> | null
}

export interface FubUserDiff<T = any> {
  prop: string
  from: T
  to: T
}

export interface ApiFUBUser {
  id: number
  created: string
  updated: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  status: string
  timezone: string
  beta: boolean
  picture: Record<string, string>
  pauseLeadDistribution: boolean
  lastSeenIos: null | string
  lastSeenAndroid: null | string
  lastSeenFub2: string
  canExport: boolean
  canCreateApiKeys: boolean
  isOwner: boolean
  groups: Array<{
    id: number
    name: string
  }>
  teamIds: number[]
  teamLeaderOf: unknown[]
  leadEmailAddress: string
  repliers: ApiRplAgent[]
}

export interface ApiAgentsResponse {
  offset: number
  limit: number
  total: number
  agents: ApiFUBUser[]
}

export type FubUser = Omit<ApiFUBUser, 'repliers'> & {
  changes?: FubUserDiff[]
  repliers?: ApiRplAgent
}

export type FubUsersResponse = Omit<ApiAgentsResponse, 'agents'> & {
  agents: FubUser[]
}

export interface ApiAgentsGetParams {
  limit: number
  offset: number
}

export interface ApiAgentsCreateParams {
  fname: string
  lname: string
  phone: string
  email: string
  brokerage: string
  designation: string
  avatar?: string
  location?: ApiLocation
  status?: boolean
  externalId?: string
  data?: Record<string, unknown>
}

export interface ApiAgentsCreateResponse {
  agent: ApiRplAgent
  [key: string]: unknown
}

export type ApiAgentsUpdateParams = Partial<ApiAgentsCreateParams> & {
  agentId: number
}

export type ApiAgentsUpdateResponse = ApiAgentsCreateResponse

export type ApiRplError = {
  message: string
  userMessage: string
  info: { param: string; msg: string }[]
}

export type ApiError = {
  message: string
  userMessage: string
}

export type AppError = ApiError | ApiRplError
