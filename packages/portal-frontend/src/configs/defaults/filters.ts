// WARN: These MUST be `import type` (not `import { type }`).
// The difference matters in Node.js ESM (e.g. CLI scripts using tsx):
//   `import { type X }` — the module IS loaded at runtime; only the binding is erased.
//   `import type { X }` — the entire import statement is erased; the module is never loaded.
//
// This file is part of a circular dependency chain at runtime:
//   configs/filters → barrel services/API → APILocations → utils/map/bounds
//   → utils/filters → utils/urls → @configs/estimate → estimate/types.ts → @configs/filters ← back here
//
// With `import type`, Node.js never traverses that chain for this file,
// breaking the cycle. With `import { type }`, it does — and filtersConfig
// ends up as `undefined` when estimate/types.ts tries to destructure it.

import {
  LAST_STATUS_CS,
  LAST_STATUS_DFT,
  LAST_STATUS_EXP,
  LAST_STATUS_EXT,
  LAST_STATUS_LC,
  LAST_STATUS_LSD,
  LAST_STATUS_NEW,
  LAST_STATUS_PC,
  LAST_STATUS_SC,
  LAST_STATUS_SCE,
  LAST_STATUS_SOLD,
  LAST_STATUS_SUS,
  LAST_STATUS_TER
} from '@configs/filter-constants'

import type {
  ApiLastStatus,
  ApiListing,
  ApiQueryParamsAllowedFields,
  ApiStatus,
  PropertyInsightFeature,
  QualitativeInsightValue,
  StandardStatus
} from 'services/API'
import type { Filters } from 'services/Search'

export type StyleOption = string | { value: string | string[]; label: string }
export type StyleGroup = {
  title?: string
  listingType?: string | string[]
  multiSelect?: boolean
  options: StyleOption[]
}
export type StyleOptions = (StyleOption | StyleGroup)[]

/**
 * Search filter model: the default filter state, the option lists that populate the
 * filter UI, and which advanced-filter slots each tenant shows. Import as
 * `import filters from '@configs/filters'`.
 */

/** Top-level listing status tabs available in search. */
const listingStatuses = ['active', 'sold', 'all', 'rent'] as const

/**
 * Every status key any tenant can map — the source of truth for `ListingStatus`.
 * Superset of the default tabs: URBN (RESO `standardStatus`) also surfaces `pending`.
 * Mirrors the `availableListingTypes` pattern.
 */
export const availableListingStatuses = [...listingStatuses, 'pending'] as const

/** Property type options offered in the type selector. */
const listingTypes = [
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

/**
 * Every listing-type key any tenant can map in the transformer — the source of
 * truth for `ListingType`. Superset of the default selector: also covers granular
 * / virtual types not shown by default (the class-aware residential/condo townhome
 * split, NYC co-ops, plus penthouse / loft search shortcuts).
 */
export const availableListingTypes = [
  ...listingTypes,
  'residentialTownhome',
  'condoTownhome',
  'coop',
  'penthouse',
  'loft',
  // Catch-all bucket a tenant can surface to fold leftover propertyTypes into
  // one filter (e.g. URBN groups commercial / manufactured / timeshare here).
  'other'
] as const

/** The listing types the default selector renders — the key set a tenant's
 *  declaration override is constrained to. A tenant with its own `listingTypes`
 *  const constrains against that instead. */
export type DefaultListingType = (typeof listingTypes)[number]

const listingFields: Array<ListingFields> = [
  'mlsNumber',
  'status',
  'type',
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
  'office',
  'agents',
  'updatedOn',
  'daysOnMarket',
  'simpleDaysOnMarket',
  'boardId',
  'duplicates',
  'openHouse',
  'timestamps',
  // Regular /listings returns permissions by default, but cluster-inlined
  // listings are shaped strictly by clusterFields (= listingFields). Requesting
  // it here keeps displayPublic on map markers/popups so restricted listings
  // scrub consistently with the side grid instead of only in cluster mode.
  'permissions'
]

const listingDetailsParams = {
  fields: ['raw'].join(',')
}

const aiQuality = [
  ['Excellent', 'excellent'],
  ['Good', 'above average'],
  ['Average', 'average'],
  ['Fair', 'below average'],
  ['Poor', 'poor']
] as [string, QualitativeInsightValue][]

const aiQualityFeatureNames: Partial<Record<PropertyInsightFeature, string>> = {
  frontOfStructure: 'Front View'
}

/** Baseline filter state applied on a fresh search, before URL params are merged in. */
const defaultFilters: Filters = {
  listingStatus: 'active',
  listingType: 'allListings',
  sortBy: 'createdOnDesc',
  // Geo-location filters (empty string by default to allow nonDefaultFilter to work)
  area: '',
  city: '',
  neighborhood: '',
  location: '',
  locationId: '',
  externalLocationId: '',
  officeId: '',
  agentId: '',
  brokerage: '',
  source: 'listings',
  slug: ''
}

/** Baseline values for the advanced (numeric / range / quality) filters. */
const defaultAdvancedFilters: Filters = {
  minBedrooms: 0,
  minBaths: 0,
  minGarageSpaces: 0,
  minParkingSpaces: 0,
  minPrice: 0,
  maxPrice: 0,
  minYearBuilt: null,
  maxYearBuilt: null,
  daysOnMarket: 'any',
  soldWithin: 'any',
  soldRange: '',
  activeRange: '',
  cancelledRange: '',
  overallQuality: null,
  livingRoomQuality: null,
  diningRoomQuality: null,
  kitchenQuality: null,
  bedroomQuality: null,
  bathroomQuality: null,
  frontOfStructureQuality: null,
  search: '',
  openHouse: undefined,
  style: undefined,
  basement: undefined
}

/**
 * Price-picker histogram. Repliers returns raw buckets 100_000 (sale) / 500 (lease)
 * wide; `size` asks for a different width and is sent only where a tenant sets it.
 * `steps` counts those raw buckets, so a band starting at `from` is `size * steps`
 * wide on screen — the two always move together.
 */
export type PriceBuckets = Record<
  'sale' | 'rent',
  { size?: number; limits: { from: number; steps: number }[] }
>

const priceBuckets: PriceBuckets = {
  sale: {
    limits: [
      { from: 1_000_000, steps: 2 },
      { from: 1_600_000, steps: 4 },
      { from: 2_400_000, steps: 6 },
      { from: 3_000_000, steps: 10 }
    ]
  },
  rent: {
    limits: [
      { from: 4_000, steps: 2 },
      { from: 6_000, steps: 4 }
    ]
  }
}

/**
 * All possible advanced-filter slots across every tenant — the source of truth for
 * the `AdvancedFilterSlot` type. Use `'-'` as a visual separator between groups.
 */
export const availableAdvancedFilters = [
  'minBedrooms',
  'minBaths',
  'minGarageSpaces',
  'minParkingSpaces',
  'price',
  'daysOnMarket',
  'yearBuilt',
  'maintenanceFee',
  'lotSize',
  'lotFrontage',
  'propertySize',
  'search',
  'openHouse',
  'openHouseDate',
  'styleHome',
  'basementHome',
  'cancelledRange',
  'activeRange',
  'soldRange',
  'activeAndSoldRange',
  '-'
] as const

export type AdvancedFilterSlot = (typeof availableAdvancedFilters)[number]

/** Default slot ordering shown in the advanced-filter UI; tenants override to swap/reorder. */
const advancedFilterSlots = [
  'minBedrooms',
  'minBaths',
  'minGarageSpaces',
  'minParkingSpaces',
  'price',
  'daysOnMarket',
  'yearBuilt',
  'lotSize',
  'propertySize',
  'maintenanceFee',
  'search',
  'openHouse'
] as const satisfies readonly AdvancedFilterSlot[]

export type ListingStatus = (typeof availableListingStatuses)[number]

/** One status-axis wire fragment: legacy `status`/`lastStatus` or RESO
 *  `standardStatus` — never both vocabularies in one fragment. */
export type StatusFilter = {
  status?: ApiStatus | ApiStatus[]
  lastStatus?: ApiLastStatus | ApiLastStatus[]
  standardStatus?: StandardStatus[]
}

export type StatusFilterKey =
  | 'active'
  | 'activeRange'
  | 'sold'
  | 'leased'
  | 'unavailable'
  | 'any'
  | 'cancelled'

/** Status wire fragments for request sites outside the status-tab UI (sitemaps,
 *  carousels, stats, range filters). Keys follow the dialects that exist in the
 *  code, not an idealized taxonomy — e.g. `unavailable` (bare `status:'U'`,
 *  date-bounded by the caller) is deliberately NOT unified with `sold`, which
 *  would silently drop terminated/expired listings from statistics. A complete
 *  record: a tenant override must map every key, so a legacy fragment can never
 *  leak into a RESO tenant. */
const statusFilters: Record<StatusFilterKey, StatusFilter> = {
  active: {
    status: 'A',
    // Explicit on-market allowlist, shared by the Active and Rent tabs: sale
    // codes (Sc/Sce/Cs) and the lease code (Lc). Excludes closed/cancelled
    // anomalies, Dft among them (see `cancelled`).
    // `Lce` arrives in response data but is NOT in Repliers' documented
    // lastStatus vocabulary — filtering by it is unsupported, so it is never
    // requested; `utils/listings/status.ts` still classifies it as pending.
    lastStatus: [
      LAST_STATUS_NEW,
      LAST_STATUS_PC,
      LAST_STATUS_SC,
      LAST_STATUS_SCE,
      LAST_STATUS_CS,
      LAST_STATUS_EXT,
      LAST_STATUS_LC
    ]
  },
  activeRange: {
    // Backs the activeRange advanced filter ("Listed within N days").
    status: 'A',
    lastStatus: [LAST_STATUS_NEW, LAST_STATUS_SC, LAST_STATUS_PC]
  },
  // Sold includes conditional sales (Sc/Sce) — one "sold" definition across the
  // app; cards badge them "Sold Conditionally" (user-approved 2026-08-20).
  sold: {
    status: 'U',
    lastStatus: [LAST_STATUS_SOLD, LAST_STATUS_SC, LAST_STATUS_SCE]
  },
  leased: { status: 'U', lastStatus: [LAST_STATUS_LSD] },
  unavailable: { status: 'U' },
  any: { status: ['A', 'U'] },
  cancelled: {
    status: 'U',
    lastStatus: [
      LAST_STATUS_TER,
      LAST_STATUS_EXP,
      LAST_STATUS_SUS,
      LAST_STATUS_DFT
    ]
  }
}

/** A tenant's listing-status declaration: each status → the query fragment it
 *  contributes (Repliers `status`/`lastStatus`, or RESO `standardStatus`). Spread
 *  into the query by the `listingStatus` transformer. */
export type ListingStatusDeclaration = Partial<
  Record<ListingStatus, Record<string, unknown>>
>

/** Built-in status declaration (Repliers `status`/`lastStatus`). RESO tenants
 *  (URBN) override this with a `standardStatus`-based declaration in their config.
 *  Status axes compose from `statusFilters`; the declaration only adds the type
 *  axis (and the tenant-variable rent `propertyType`). Active and Rent share
 *  the `active` fragment's on-market allowlist. */
const listingStatusDeclaration: ListingStatusDeclaration = {
  active: {
    type: 'sale',
    ...statusFilters.active
  },
  sold: {
    type: 'sale',
    ...statusFilters.sold
  },
  all: {
    type: 'sale',
    ...statusFilters.any
  },
  rent: {
    type: 'lease',
    // The rental propertyType. Tenants override per their MLS: TREB boards use
    // `[]` (rentals are identified by `type: lease` alone), others a distinct
    // string (NWMLS: 'Rental'). Keep it non-empty wherever the MLS has one — a
    // listingType selection ANDs its own propertyTypes into the same query, and
    // no type button covers rentals.
    propertyType: ['Residential Lease'],
    ...statusFilters.active
  }
}

/** The axes a listing-type entry can constrain in a query fragment. */
export type TypeAxes = {
  class?: string | string[]
  propertyType?: string | string[]
  style?: string | string[]
  search?: string
}

/** A tenant's listing-type declaration: each type → the query fragment it
 *  contributes (`class` / `propertyType` / `style`). Spread into the query by the
 *  `listingType` transformer; also reverse-mapped by `getListingType`. */
export type ListingTypeDeclaration = Partial<
  Record<ListingType, Record<string, unknown>>
>

/** Default (Repliers) listing-type declaration: one entry per default `listingTypes`
 *  button → the query fragment it contributes (`class` / `propertyType` / `style`).
 *  Tenants override per type via `deepmerge` with array-overwrite, and may add their
 *  own rendered types (e.g. URBN `other`, movesmartly `condoTownhome`). The virtual
 *  `penthouse` / `loft` / `allListings` entries are derived in the Search layer
 *  (`services/Search/listingTypeDeclaration`), never stored here. */
const listingTypeDeclaration: ListingTypeDeclaration = {
  residential: {
    class: 'residential',
    propertyType: ['Residential']
  },
  condo: {
    class: 'condo',
    propertyType: ['Residential'],
    style: ['Condominium', 'Apartment', 'Flat Condo', 'Other Condo']
  },
  townhome: {
    style: ['Townhouse']
  },
  semiDetached: {
    style: ['Duplex', 'Half Duplex', 'Triplex', 'Quadruplex']
  },
  multiFamily: {
    style: ['Multi Family', 'Multi-Family 2-4']
  },
  land: {
    // WARN: pretty controversial class definition for land listings
    class: ['residential', 'condo', 'commercial'],
    propertyType: ['Land']
  },
  business: {
    propertyType: ['Business Opportunity']
  },
  commercial: {
    // WTF: why did we disable it?
    // class: 'commercial',
    propertyType: ['Commercial Sale']
  }
}

export type ListingType = (typeof availableListingTypes)[number]
export type ListingFields = keyof ApiListing | ApiQueryParamsAllowedFields
export type PropertyClass = 'residential' | 'condo' | 'commercial' | 'all'

// The sample-data board (110) "Features": the buyer-facing RESO fields that more than
// 2% of a type's active listings hold a real value in (None, Other, See Remarks and the
// like left out); ListingTerms and BuyerFinancing stay out as deal terms. Measured
// 2026-10-01 over the 43,855 active listings. Every other tenant empties both lists.
const sharedRawFilters = [
  'AccessibilityFeatures',
  'Appliances',
  'ArchitecturalStyle',
  'Basement',
  'CommunityFeatures',
  'ConstructionMaterials',
  'Cooling',
  'ExteriorFeatures',
  'Fencing',
  'FireplaceFeatures',
  'Flooring',
  'FoundationDetails',
  'Furnished',
  'Heating',
  'InteriorFeatures',
  'LaundryFeatures',
  'Levels',
  'LotFeatures',
  'OtherEquipment',
  'OtherStructures',
  'ParkingFeatures',
  'PatioAndPorchFeatures',
  'PetsAllowed',
  'PoolFeatures',
  'RoadFrontageType',
  'RoadSurfaceType',
  'Roof',
  'SecurityFeatures',
  'Sewer',
  'StructureType',
  'Utilities',
  'View',
  'WaterSource',
  'WaterfrontFeatures',
  'WindowFeatures'
]

const config = {
  listingStatuses,
  listingTypes,
  listingFields,
  listingDetailsParams,
  aiQuality,
  aiQualityFeatureNames,
  defaultFilters,
  defaultAdvancedFilters,
  advancedFilterSlots,
  priceBuckets,
  // The price picker reads its range out in two editable inputs under the slider
  // instead of values under the thumbs and min/max at the ends.
  priceInputs: true,

  // listingStatus
  listingStatusDeclaration,
  statusFilters,

  /**
   * Which listing field supplies the "sold date" shown across the app (PDP header,
   * details table) and used to order "recently sold" lists.
   *
   * The right field differs by market because the terminology differs:
   * - Legacy Canadian feeds record a firm SALE — the top-level `soldDate` is
   *   populated and dependable. This is the default.
   * - RESO boards stamp `soldDate` at MUTUAL ACCEPTANCE — when the parties shake
   *   hands and the deal goes pending — long before it is legally finalized, so it
   *   does NOT mark a completed sale. The dependable date is when the deal actually
   *   CLOSES: `timestamps.closedDate`.
   *
   * The value is read through `soldDate()`. The SAME flag also selects the sort
   * token `soldDateDesc` (`'soldDateDesc'` vs `'closedDateDesc'`) and the date-range
   * keys in `soldDateRange()` (`minSoldDate`/`maxSoldDate` vs the closed pair), so
   * the displayed field, the "recently sold" order and every sold window agree.
   */
  soldDateSource: 'soldDate' as 'soldDate' | 'closedDate',

  /**
   * Over a chosen sold range (`soldRange`) the price filter bounds the sold price
   * (`minSoldPrice`/`maxSoldPrice`) instead of the list price, and "Newest to
   * Oldest" (`createdOnDesc`) orders by the sale date. Applied in the Search adapter.
   */
  soldPriceAndDate: false,

  // Allow selecting several listing statuses at once (multi-select status
  // selector). When false the status tabs are single-choice.
  multiListingStatus: false,

  // listingType
  listingTypeDeclaration,
  // Allow selecting several listing types at once (multi-select type selector).
  // When false the type selector is single-choice.
  multiListingType: false,
  // Only meaningful with `multiListingType: true`. When multiple types are
  // selected, send them as a UNION of POST `queries` (OR) instead of flattening
  // every type's class/propertyType/style into one top-level AND. Required for
  // tenants whose types live on different axes (e.g. URBN `townhome` = style,
  // `residential` = propertyType), where the flat AND collapses the result to
  // their intersection. See `applyListingTypeUnion` in the Search adapter.
  unionListingTypes: false,

  // The dialog's "Features" tab, shown while a tenant lists any field: MLS raw fields
  // named as the board's raw data names them (`Appliances`), one list per transaction
  // type — every board ships its own names and values. A sale ↔ lease switch drops the
  // selections of fields missing from the other list. `previewMatches` lists a searched
  // field's matching values under its title; off, a yellow circle on the chevron marks
  // them. `contains` sends every selected value as `contains:<value>`, for boards that
  // file a multi-value field as one comma-joined string ("InUnit,SeeRemarks"), which an
  // exact value matches only when it stands alone — see
  // docs/design/serhant/advanced-search-spec.md §3.5.
  rawFilters: {
    sale: [
      ...sharedRawFilters,
      'DevelopmentStatus',
      'DoorFeatures',
      'PossibleUse',
      'SpecialListingConditions'
    ],
    lease: [...sharedRawFilters, 'LeaseTerm', 'OwnerPays', 'TenantPays'],
    previewMatches: true,
    contains: false
  },

  styleOptions: [] as StyleOptions,
  basementOptions: [] as StyleOptions,
  // Slots that appear in the bar on desktop but overflow into the dialog on mobile
  barFilterSlots: [] as AdvancedFilterSlot[]
}

export default config
