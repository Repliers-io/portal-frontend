import { type Geometry } from 'geojson'

// ── Auth ───────────────────────────────────────────────────────────

export type AuthRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string
}

// ── Listing ────────────────────────────────────────────────────────

export type BenchmarkCategory =
  | 'WayBelowAverage'
  | 'BelowAverage'
  | 'Average'
  | 'AboveAverage'
  | 'WayAboveAverage'

export type InsightIcon =
  | 'Price'
  | 'Caution'
  | 'Condo'
  | 'Heritage'
  | 'BuildingPermit'
  | 'Parking'

export type Insight = {
  explanation: string
  icon?: InsightIcon
}

export type BuildingPermit = {
  isOpenPermit: boolean
  permitNumber: string | null
  permitStatus: string | null
  permitType: string | null
  description: string | null
  issueDate: string | null
  completionDate: string | null
}

// The API wraps permits in an object: `permits` is the list, `message` is an
// optional note shown when there are none (e.g. condos never carry permits).
// `message` can be null even with an empty list.
export type BuildingPermitsInfo = {
  permits: BuildingPermit[]
  message: string | null
}

// Lot facts derived from the municipal parcel the listing's coordinates fall in
// (coverage: Toronto, York Region, Mississauga). From municipal parcel data, not the
// MLS record — distinct from the Repliers `listing.lot` (frontage/depth/legal).
export type LotParcel = {
  /** Parcel area in square metres. */
  areaSqM: number
  /** Parcel area in square feet. */
  areaSqFt: number
  /** How close the lot shape is to a perfect rectangle: 0–1, 1.0 = perfect. */
  rectangularity: number
  /** True when `rectangularity` < 0.75 (pie / flag / dog-leg shaped lots). */
  isIrregularShape: boolean
}

// Each field is null when MoveSmartly does not stand behind the estimate
// (suite not matched to a unit, flagged low-confidence, or no corp size data).
export type CondoUnit = {
  /** Estimated suite size, whole sq ft. */
  estimatedSqft: number | null
  /** Sold price (sold/leased) or list price over `estimatedSqft`; monthly rent for leases. */
  pricePerSqft: number | null
  sizeConfidence: string | null
}

export type ListingInfo = {
  insights: Insight[]
  buildingPermits: BuildingPermitsInfo
  /** Parcel-derived lot facts; `null`/absent when no parcel covers the address. */
  lot?: LotParcel | null
  /** `null` when the listing is not matched to a condo building. */
  condo?: { unit?: CondoUnit | null } | null
}

// ── Demographics ───────────────────────────────────────────────────

export type DemographicDataItem = {
  name: string
  value: number
}

export type DemographicBar = {
  datum?: DemographicDataItem[]
}

export type DemographicListItem = {
  name: string
  value: number
}

export type DemographicList = {
  topItems?: DemographicListItem[]
  decimalPlaces?: number
}

export type BenchmarkedFigure = {
  value: number
  average: number
  benchmark?: BenchmarkCategory
  parentRegionName: string | null
  grandparentRegionName: string | null
  parentValue: number
  grandParentValue: number | null
  benchmarkClassName?: string
  benchmarkDescription?: string
}

export type BenchmarkedPie = {
  value: number
  average: number
  benchmark?: BenchmarkCategory
  parentRegionName: string | null
  grandParentRegionName: string | null
  parentValue: number
  grandParentValue: number | null
  benchmarkClassName?: string
  benchmarkDescription?: string
}

export type Demographics = {
  uniquenessStatement?: string
  ages?: DemographicBar
  families?: BenchmarkedFigure
  income?: BenchmarkedFigure
  shelters?: BenchmarkedFigure
  affordableHousing?: BenchmarkedFigure
  singles?: BenchmarkedPie
  renters?: BenchmarkedPie
  education?: BenchmarkedPie
  newToCanada?: BenchmarkedPie
  professions?: DemographicList
  countriesOriginAll?: DemographicList
  countriesOriginRecent?: DemographicList
  languages?: DemographicList
  religions?: DemographicList
}

// ── Region ─────────────────────────────────────────────────────────

export type RegionTypeId =
  | 'MoveSmartlyGta'
  | 'TrrebArea'
  | 'TrrebMunicipality'
  | 'TrrebCommunity'
  | 'MoveSmartlyNeighbourhood'
  | 'FormerTorontoMunicipalities'

export type Region = {
  id: number
  regionTypeId?: RegionTypeId
  displayName: string
  websitePath: string
  district: string
  boundary: Geometry
  children?: Region[]
  demographics?: Demographics
}

// ── Parcel ─────────────────────────────────────────────────────────

export type LatLng = {
  lat: number
  lng: number
}

export type LatLngBounds = {
  southWest: LatLng
  northEast: LatLng
}

export type ParcelRequest = {
  bounds: LatLngBounds
}

export type Parcel = {
  boundary: Geometry
}

// ── Condo Development ──────────────────────────────────────────────

export type CondoDevelopment = {
  id: number
  latitude: number
  longitude: number
  maximumStoreys: number | null
  totalUnits: number | null
  completionDate: string | null
  title: string
  projectUrl: string
  primaryImageUrl: string
  category: string
  constructionStatus: string
  address: string
  city: string | null
  developer: string | null
}

// ── Social Housing ─────────────────────────────────────────────────

export type AffordableHousingProjectType =
  | 'CommunityHousing'
  | 'AffordableHousing'
  | 'Shelter'

export type SocialHousing = {
  id: number
  latitude: number
  longitude: number
  projectType: AffordableHousingProjectType
  name: string
  constructionStatus: string
  address: string | null
  city: string
  postalCode: string | null
}

// ── Bbox ───────────────────────────────────────────────────────────

export type Bbox = {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

// ── School ─────────────────────────────────────────────────────────

export type CommuteMode = 'walking' | 'driving'

export type SchoolAssociation = {
  gradeFrom: number
  gradeEnd: number
  programType: string | null
  programName: string | null
  schoolId: number
}

export type SchoolBoundary = {
  gradeFrom: number
  gradeEnd: number
  isElementary: boolean
  isMiddle: boolean
  isHigh: boolean
  isEnglish: boolean
  isFrenchImmersion: boolean
  isExtendedFrench: boolean
  isAP: boolean
  isIB: boolean
  isGifted: boolean
  isArts: boolean
  isSport: boolean
  boundary: Geometry | null
  // Only present in /api/schools/coords responses — true when this catchment
  // contains the listing coordinates.
  matched?: boolean
}

export type School = {
  id: number
  name: string | null
  shortName: string | null
  url: string | null
  address: string | null
  city: string | null
  province: string | null
  country: string | null
  postalCode: string | null
  phone: string | null
  fax: string | null
  isPublic: boolean
  isCatholic: boolean
  gradeFrom: number
  gradeEnd: number
  isElementary: boolean
  isMiddle: boolean
  isHigh: boolean
  isEnglish: boolean
  isFrenchImmersion: boolean
  isExtendedFrench: boolean
  isAP: boolean
  isIB: boolean
  isGifted: boolean
  isArts: boolean
  isSport: boolean
  latitude: number
  longitude: number
  englishGrade: string | null
  mathGrade: string | null
  lastReviewDate: string
  boundaries: SchoolBoundary[] | null
  associations: SchoolAssociation[] | null
}

// ── School type filters ────────────────────────────────────────────
// Shared between API route handlers (server) and client-side filter hooks.
// elementary/secondary: grade-level gates; public/catholic/french: board gates.
export type SchoolFilters = {
  elementary: boolean
  secondary: boolean
  public: boolean
  catholic: boolean
  french: boolean
}

// Board/language subset of SchoolFilters used by the client-side type predicate
// (matchesSchoolTypes), shared between the PDP sidebar and the main map overlay.
export type SchoolTypeFilters = Pick<
  SchoolFilters,
  'public' | 'catholic' | 'french'
>

// School with precomputed union bounding box of all boundary polygons.
// Computed once at cache-formation time — avoids re-iterating geometry on each request.
// null when the school has no boundary data (fall back to center-point check).
// English bbox covers English-language boundaries, French bbox covers
// French-language ones — split by boundary.isEnglish, matching how the map
// renders catchment polygons.
// Stored separately so viewport/point prefilters and fitBounds always use
// the right geometry for the context.
export type SchoolCached = School & {
  englishBbox: Bbox | null
  frenchBbox: Bbox | null
}

// Shape returned by /api/schools — School fields plus BOTH boundary bboxes
// (English + French). The client picks the one matching the active language
// filter, so fitBounds always matches the catchment polygon shown on screen.
// catchment: true  → point fell inside this school's polygon (name includes "(Catchment)")
// catchment: false → school is within the requested radius but point is outside its polygon
// catchment absent → response from a non-coords endpoint (no polygon match was attempted)
export type SchoolResponse = School & {
  id: string
  englishBbox?: Bbox | null
  frenchBbox?: Bbox | null
  catchment?: boolean
}

// ── Agent ──────────────────────────────────────────────────────────

export type ReviewAgentModel = {
  id: number
  firstName: string
  lastName: string
}

export type DirectoryAgentModel = {
  id: number
  firstName: string
  lastName: string
  email: string
  imageUrl: string | null
  xTwitterUrl: string | null
  instagramUrl: string | null
  blogUrl: string | null
  jobTitle: string | null
  jobDescription: string | null
  directorySortOrder: number | null
}

// ── Agent Reviews ──────────────────────────────────────────────────

export const boughtSoldValues = [
  'Bought',
  'Sold',
  'BoughtAndSold',
  'Leased'
] as const
export type AgentReviewBoughtSold = (typeof boughtSoldValues)[number]

export type AgentReviewModel = {
  id: number
  boughtSold: AgentReviewBoughtSold
  rating: number
  comments: string
  postDate: string
  memberDisplayName: string
  neighbourhood: string
  responseDate: string | null
  response: string | null
}

export type AgentReviewsSummaryModel = {
  rating: number
  totalReviews: number
  total1StarReviews: number
  total2StarReviews: number
  total3StarReviews: number
  total4StarReviews: number
  total5StarReviews: number
}

export type AgentReviewCreateRequest = {
  agentId?: number
  boughtSold?: AgentReviewBoughtSold
  rating?: number
  comments?: string
  memberDisplayName?: string
  neighbourhood?: string
  address?: string | null
  postIpAddress?: string
  memberRepliersId: string
}

export type AgentReviewsQuery = {
  agentId?: number
  take?: number
  skip?: number
}

// ── Career ─────────────────────────────────────────────────────────

export type CareerModel = {
  jobTitle: string
  jobDescription: string
  sortOrder: number
}

// Career shaped for the client: the markdown jobDescription is pre-rendered to
// sanitized HTML in the /api/career route, so the client needs no sanitizer.
export type CareerViewModel = Omit<CareerModel, 'jobDescription'> & {
  descriptionHtml: string
}

// ── Aggregated response (super-function) ───────────────────────────

export type ListingEnrichedData = {
  listing: ListingInfo
}
