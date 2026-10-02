import { type Position } from 'geojson'
import { type LngLatBounds } from 'mapbox-gl'

export const locationTypes = ['state', 'area', 'city', 'neighborhood'] as const

export type ApiLocationType = (typeof locationTypes)[number]

// LiveBy overlay location types — deliberately kept OUT of `locationTypes` so
// they don't leak into listing geo-filter machinery (ApiGeoFilters / Search
// Filters and every loop that iterates `locationTypes`). Used only for
// `/locations?source=LiveBy` overlay requests.
export const liveByLocationTypes = [
  'postalCode',
  'district',
  'neighborhood',
  'schoolDistrict',
  'school'
] as const

export type LiveByLocationType = (typeof liveByLocationTypes)[number]

// A location's `type`. The known MLS (`ApiLocationType`) and LiveBy
// (`LiveByLocationType`) types drive autocomplete; `(string & {})` keeps it open to
// any type a non-MLS source may return (e.g. `UserDefined` with arbitrary names)
// without collapsing the union to a bare `string`.
export type LocationType = ApiLocationType | LiveByLocationType | (string & {})

// Which `/locations` data source a location came from. The API returns it on every
// location when `source` is requested in `fields`. `'MLS'` is the API's own default
// source; tenants on other sources use `'LiveBy'`/`'UserDefined'`; `'PublicRecord'`
// serves assessor parcels (`type: 'property'`). Used so the city/neighborhood
// lookups stay within one source (ids line up).
export type LocationDataSource =
  | 'LiveBy'
  | 'UserDefined'
  | 'MLS'
  | 'PublicRecord'

export interface ApiLocationCoordinates {
  lat: number
  lng: number
}

export type LiveBySchoolRank = {
  year: number
  rank: number
  rankOf: number
  rankStars: number
  rankLevel: string
}

export type LiveBySchoolMetrics = {
  rankHistory: LiveBySchoolRank[]
  schoolYearlyDetails: Array<Record<string, number | null>>
}

export type LiveBySchool = {
  schoolName: string
  districtName: string | null
  phone?: string | null
  website?: string | null
  schoolType: string | null
  schoolLevel: string | null
  lowGrade: string | null
  highGrade: string | null
  isCharterSchool?: boolean | null
  isMagnetSchool?: boolean | null
  isPrivate?: boolean | null
  isAssigned?: boolean | null
  schoolDistrictLocationId?: string
  metrics?: LiveBySchoolMetrics
}

export type ApiLocation = {
  locationId: string
  name: string
  type: LocationType
  subType?: string | null
  size?: number
  school?: LiveBySchool
  map?: {
    latitude: number
    longitude: number
    point?: string
    geometryType?: string
    /**
     * Full polygon geometry. Drives map rendering AND the listing query: when
     * present, `extractLocationPolygons` searches listings by this polygon
     * (`map=`) instead of by `locationId`. Carry it only when polygon-search is
     * intended; for `locationId`-filtered selections (e.g. school markers) use
     * `bounds` for framing instead.
     */
    boundary?: Position[][][] | Position[][]
  }
  /**
   * Rectangular extent for camera framing only (no geometry). Search-neutral —
   * unlike `map.boundary` it never switches the listing query to polygon search.
   * Use for locations framed without polygon-search (API bbox, address, polygon
   * bbox). Resolved via `getLocationExtent`.
   */
  bounds?: LngLatBounds | null
  demographics?: LocationDemographics
  address?: {
    country?: string
    state?: string
    area?: string
    city?: string
    neighborhood?: string
  }
  activeCount?: number
  /** Which source this location's data came from (tagged at selection time). */
  source?: LocationDataSource
  /**
   * External-source overlay location (e.g. a MoveSmartly school): `locationId`
   * is a composite `<overlayId>-<rest>` id unknown to the Repliers API. Feeds
   * the `externalLocationId` filter/URL param and searches listings by its
   * `map.boundary` polygon inside a POST query — never by id.
   */
  external?: boolean
}

// ── Location demographics ─────────────────────────────────────────

export type LocationDemographicItem = {
  name: string
  value: number
  pictureClassName?: string
}

export type LocationDemographicList = {
  topItems: LocationDemographicItem[]
  decimalPlaces: number
}

export type LocationBenchmark = {
  value: number
  parentRegionName: string
  grandparentRegionName?: string | null
  grandParentRegionName?: string | null
  parentValue: number
  grandParentValue: number
}

export type LocationDemographics = {
  uniquenessStatement?: string
  ages?: { datum: LocationDemographicItem[] }
  families?: LocationBenchmark
  income?: LocationBenchmark
  shelters?: LocationBenchmark | null
  affordableHousing?: LocationBenchmark | null
  singles?: LocationBenchmark
  renters?: LocationBenchmark
  education?: LocationBenchmark
  newToCanada?: LocationBenchmark
  professions?: LocationDemographicList
  countriesOriginAll?: LocationDemographicList
  countriesOriginRecent?: LocationDemographicList
  languages?: LocationDemographicList
  religions?: LocationDemographicList
}

export type ApiLocationWithBounds = ApiLocation & {
  bounds: LngLatBounds | null
}

export type ApiGeoFilters = Partial<
  Record<ApiLocationType | 'locationId', string | string[]>
>

export type ApiLocationsRequest = ApiGeoFilters & {
  lat?: number
  long?: number
  radius?: number
  /** Viewport rectangle as the `map=` polygon string (`toRectangle`) — an exact area
   *  filter, unlike `radius`, whose API floor is 1km. */
  map?: string
  source?: string
  type?: LocationType | LocationType[]
  fields?: string | string[]
  boundary?: boolean
  hasBoundary?: boolean
  pageNum?: number
  resultsPerPage?: number
}

export type ApiLocationsResponse = {
  page: number
  numPages: number
  pageSize: number
  count: number
  locations: ApiLocation[]
}

export type GeoFilters = Partial<Record<ApiLocationType, string | string[]>>

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

// ── LiveBy neighborhood demographics (US Census ACS 2023) ────────────────────

export type LiveByDemographics = {
  age: {
    byCohort: {
      between0To4: number
      between5To9: number
      between10To14: number
      between15To19: number
      between20To24: number
      between25To29: number
      between30To34: number
      between35To39: number
      between40To44: number
      between45To49: number
      between50To54: number
      between55To59: number
      between60To64: number
      between65To69: number
      between70To74: number
      between75To79: number
      between80To84: number
      between85AndOver: number
    }
    byLifeStage: {
      between0To9: number
      between10To17: number
      between18To24: number
      between25To64: number
      between65To74: number
      between75AndOver: number
    }
  }
  rent: {
    over999: number
    under499: number
    between500To749: number
    between750To999: number
  }
  rooms: {
    studio: number
    oneBedroom: number
    twoBedrooms: number
    threeBedrooms: number
    fourBedroomsOrMore: number
  }
  income: {
    byLevel: {
      over100000: number
      between0To25000: number
      between25000To35000: number
      between35000To50000: number
      between50000To75000: number
      between75000To100000: number
    }
    byCohort: Record<string, number>
  }
  jobType: { blueCollar: number; whiteCollar: number }
  education: {
    master: number
    bachelor: number
    noDegree: number
    doctorate: number
    highSchool: number
    collegeBelowBachelor: number
  }
  homeValue: {
    above500000: number
    below100000: number
    between100000To150000: number
    between150000To200000: number
    between200000To300000: number
    between300000To500000: number
  }
  jobSector: {
    privateWorker: number
    governmentWorker: number
    notForProfitWorker: number
    selfEmployedWorker: number
    unpaidFamilyWorker: number
  }
  medianAge: number
  occupancy: {
    vacant: number
    absenteeOwner: number
    unitOccupiedOwner: number
    unitOccupiedRenter: number
  }
  yearBuilt: {
    after2019: number
    before1970: number
    between1970To1979: number
    between1980To1989: number
    between1990To1999: number
    between2000To2009: number
    between2010To2019: number
  }
  enrollment: {
    none: number
    publicSchool: number
    privateSchool: number
    publicCollege: number
    privateCollege: number
    publicPrePrimarySchool: number
    privatePrePrimarySchool: number
  }
  occupation: {
    sales: number
    trades: number
    management: number
    agriculture: number
    manufacturing: number
    notApplicable: number
    appliedScience: number
    artCultureSport: number
    businessFinanceAdmin: number
    educationLawSocialGovernment: number
  }
  population: number
  commuteTime: {
    over60Minutes: number
    under15Minutes: number
    between15To29Minutes: number
    between30To59Minutes: number
  }
  percentMale: number
  percentFemale: number
  medianIncome: number
  maritalStatus: {
    single: number
    married: number
    widowed: number
    divorced: number
    separated: number
  }
  countMarried: number
  countUnmarried: number
  medianHouseValue: number
  populationDensity: number
  populationDensityUnit: string
  privateHouseholds: number
  transportationMode: {
    other: number
    walked: number
    bicycle: number
    carSelf: number
    carAlone: number
    carDriver: number
    carCarpool: number
    publicTransit: number
  }
  averageHouseholdSize: number | null
  averageRooms: number
  educationClimateIndex: number
  medianMortgagePayment: {
    over4000: number
    under500: number
    between500To1000: number
    between1000To2000: number
    between2000To3000: number
    between3000To4000: number
  }
  medianRentMonthlyCost: number
  medianMortgageMonthlyCost: number
  householdsWithChildren?: number
  annualResidentialTurnover?: number
  averageTravelTime?: number | null
  confidence?: number
  metadata: { source: string; attribution: string }
}

// ApiLocation with demographics typed as LiveBy neighborhood shape.
// Used only for the PDP demographics section fetch — does not affect
// existing usage of ApiLocation.demographics (MoveSmartly/Canadian data).
export type LiveByDemographicsLocation = Omit<ApiLocation, 'demographics'> & {
  demographics?: LiveByDemographics
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
