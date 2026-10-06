import filtersConfig from '@configs/filters'
import locationConfig from '@configs/location'
import {
  type AdvancedFilterSlot,
  type ListingType,
  type StyleGroup,
  type StyleOptions
} from '@defaults/filters'

import { type ApiLocation } from 'services/API'
import { type Filters } from 'services/Search'
import { sentenceCase, splitCamelCase } from 'utils/strings'
import { parseLocationPath } from 'utils/urls'

const {
  defaultFilters,
  defaultAdvancedFilters,
  advancedFilterSlots,
  barFilterSlots,
  priceBuckets,
  listingStatuses
} = filtersConfig

// The propertyType / style match lists a tenant maps to a listing type.
export const propertyTypesOf = (type: ListingType): string[] =>
  (filtersConfig.listingTypeDeclaration[type]?.propertyType as string[]) ?? []
export const stylesOf = (type: ListingType): string[] =>
  (filtersConfig.listingTypeDeclaration[type]?.style as string[]) ?? []

// The lease side of the sale/lease axis: the rent status, or the separate `type`
// axis some tenants (movesmartly) use.
export const leaseSearch = ({ listingStatus, type }: Filters) =>
  [listingStatus].flat().includes('rent') || type === 'lease'

// The raw fields offered for the filters' transaction type.
export const rawFieldsFor = (filters: Filters) =>
  filtersConfig.rawFilters[leaseSearch(filters) ? 'lease' : 'sale']

// The dialog's "Features" tab: present while the tenant lists any raw field.
export const featuresTab =
  filtersConfig.rawFilters.sale.length + filtersConfig.rawFilters.lease.length >
  0

// Raw-field selections live in the filters as `raw.<Field>: string[]` keys, the API's
// own parameter names. They are not declared on `Filters` — a template index there
// would widen `keyof Filters` for every reader — so they are read and written here.
export const rawValues = (filters: object, field: string): string[] =>
  (filters as Record<string, string[] | undefined>)[`raw.${field}`] ?? []

export const rawSelection = (field: string, values: string[]): Filters =>
  Object.fromEntries([[`raw.${field}`, values.length ? values : undefined]])

// Every raw selection as a `contains:` match (`rawFilters.contains`).
export const containsRawValues = <T extends object>(params: T): T =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      // an emptied field stays unset (`rawSelection`), so the query drops it
      key.startsWith('raw.') && value != null
        ? [value].flat().map((item) => `contains:${item}`)
        : value
    ])
  ) as T

// the dialog's tab already says "Features", so the field names drop the word
export const rawFieldLabel = (field: string) =>
  sentenceCase(splitCamelCase(field).replace(/\s*\bFeatures\b/, ''))

export const selectedRawFields = (filters: object) =>
  Object.entries(filters)
    .filter(
      ([key, value]) =>
        key.startsWith('raw.') && Array.isArray(value) && value.length > 0
    )
    .map(([key]) => key.slice('raw.'.length))

// Clears the selections of fields the next transaction type does not offer.
export const foreignRawReset = (
  filters: object,
  fields: readonly string[]
): Filters =>
  Object.fromEntries(
    selectedRawFields(filters)
      .filter((field) => !fields.includes(field))
      .map((field) => [`raw.${field}`, undefined])
  )

// URL params → the `raw.` filters of the offered fields, each as an array. The key
// turns into an API parameter name, so only the listed fields pass.
export const pickRawFilters = (
  params: Record<string, string | string[] | undefined>,
  fields: readonly string[]
): Filters =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const value = params[`raw.${field}`]
      return value ? [[`raw.${field}`, [value].flat()]] : []
    })
  )

const slotFields: Record<AdvancedFilterSlot, (keyof Filters)[]> = {
  minBedrooms: ['minBedrooms'],
  minBaths: ['minBaths'],
  minGarageSpaces: ['minGarageSpaces'],
  minParkingSpaces: ['minParkingSpaces'],
  price: ['minPrice', 'maxPrice'],
  daysOnMarket: ['daysOnMarket', 'soldWithin'],
  yearBuilt: ['minYearBuilt', 'maxYearBuilt'],
  maintenanceFee: ['maxMaintenanceFee'],
  lotSize: ['minLotSizeSqft', 'maxLotSizeSqft'],
  lotFrontage: ['minLotWidth', 'maxLotWidth'],
  propertySize: ['minSqft', 'maxSqft'],
  search: ['search'],
  openHouse: ['openHouse'],
  openHouseDate: ['openHouse'],
  styleHome: ['style'],
  basementHome: ['basement'],
  cancelledRange: ['cancelledRange'],
  activeRange: ['activeRange'],
  soldRange: ['soldRange'],
  activeAndSoldRange: ['activeRange', 'soldRange'],
  '-': []
}

// Keys `getUnknownFilters` skips. Any other active filter that has no slot in
// the tenant's advanced dialog or filter bar is listed in the dialog as a
// removable row, so a filter set from a URL, a saved search or a widget link
// never applies invisibly. A key belongs here only when it has a control of
// its own, or is not a user filter at all.
const knownFilterKeys: ReadonlySet<keyof Filters> = new Set([
  // base controls — type / status / sort / location search
  'listingType',
  // a status select exists only where the tenant lists status options
  ...(listingStatuses.length ? (['listingStatus'] as const) : []),
  'type',
  'sortBy',
  'state',
  'area',
  'city',
  'neighborhood',
  'location',
  'locationId',
  'externalLocationId',
  // the filter bar's price chip — a tenant may drop the dialog's price slot for it
  'minPrice',
  'maxPrice',
  // not user filters: featured-listings routing and paging
  'source',
  'slug',
  'pageNum',
  // the Spaces select and the AI search
  'coverImage',
  'imageSearchItems',
  // AI quality filters live in their own tab
  'minQuality',
  'maxQuality',
  'overallQuality',
  'livingRoomQuality',
  'diningRoomQuality',
  'kitchenQuality',
  'bedroomQuality',
  'bathroomQuality',
  'frontOfStructureQuality'
])

const styleOptionValues = (options: StyleGroup['options']): string[] =>
  options.flatMap((o) =>
    typeof o === 'string' ? [o] : ([o.value].flat() as string[])
  )

export const getBlockedStyleValues = (
  listingType: Filters['listingType'],
  styleOptions: StyleOptions
): string[] => {
  const types = [listingType].flat().filter(Boolean) as string[]
  if (!types.length || types.includes('allListings')) return []
  return (styleOptions as StyleGroup[])
    .filter(
      (g) =>
        g.options &&
        g.listingType &&
        ![g.listingType].flat().some((t) => types.includes(t))
    )
    .flatMap((g) => styleOptionValues(g.options))
}

export type RankOptions = { sort?: 'alpha' | 'popularity'; minCount?: number }

// Aggregate value counts → the option list: empty and rarer-than-`minCount` values
// drop out; `popularity` is count-descending with ties kept in the API's order.
export const rankOptions = (
  counts: Record<string, number>,
  { sort = 'alpha', minCount = 1 }: RankOptions = {}
) => {
  const entries = Object.entries(counts).filter(
    ([value, count]) => value && count >= minCount
  )
  entries.sort(
    sort === 'popularity'
      ? ([, a], [, b]) => b - a
      : ([a], [b]) => a.localeCompare(b)
  )
  return entries.map(([value]) => value)
}

/**
 * Histogram request params. A raw bucket width goes on the wire only where the tenant
 * asks for one — no `size` means Repliers' own width, which needs no parameter.
 */
export const priceAggregateParams = {
  aggregates: 'listPrice',
  ...(priceBuckets.sale.size
    ? { aggregatesListPriceSaleBucketSize: priceBuckets.sale.size }
    : {}),
  ...(priceBuckets.rent.size
    ? { aggregatesListPriceLeaseBucketSize: priceBuckets.rent.size }
    : {})
}

export function mergeBuckets(
  buckets: Record<string, number>,
  config: 'sale' | 'rent' = 'sale'
) {
  const { limits } = priceBuckets[config]
  let currentLimitIndex = 0
  let counter = 0
  // null, not 0 — the first bucket legitimately starts at 0, and a 0 sentinel
  // would hand the group the *second* bucket's min (e.g. `50000-100000`).
  let aggregatedMin: number | null = null
  let aggregatedValue = 0

  const result: Record<string, number> = {}
  const keys = Object.keys(buckets)
    .map((key) => {
      const [min, max] = key.includes('+')
        ? [parseInt(key, 10), undefined]
        : key.split('-').map(Number)
      return { min, max, key }
    })
    .sort((a, b) => a.min - b.min)

  keys.forEach(({ min, max, key }, index) => {
    while (
      currentLimitIndex < limits.length &&
      min >= limits[currentLimitIndex].from
    ) {
      currentLimitIndex += 1
      counter = 0
      aggregatedMin = null
      aggregatedValue = 0
    }

    if (currentLimitIndex > 0) {
      aggregatedValue += buckets[key]
      counter += 1

      if (aggregatedMin === null) {
        aggregatedMin = min
      }

      const { steps } = limits[currentLimitIndex - 1]
      const isLastElement = index === keys.length - 1
      const isPlusElement = max === undefined

      if (counter === steps || isLastElement || isPlusElement) {
        const rangeKey = isPlusElement
          ? `${aggregatedMin}+`
          : `${aggregatedMin}-${max}`
        result[rangeKey] = aggregatedValue
        counter = 0
        aggregatedValue = 0
        aggregatedMin = null
      }
    } else {
      result[key] = buckets[key]
    }
  })

  // Add the remaining buckets if any
  if (aggregatedValue > 0) {
    const lastKey = keys[keys.length - 1]
    const rangeKey =
      lastKey.max === undefined
        ? `${aggregatedMin}+`
        : `${aggregatedMin}-${lastKey.max}`
    result[rangeKey] = aggregatedValue
  }

  return result
}

const inRange = (value: number, range: string) => {
  const [min, max] = range.split('-').map(parseFloat)
  return value >= min && value < max
}

export const getBucketIndex = (value: number, bucketKeys: string[]) => {
  const index = bucketKeys.findIndex((key) => inRange(value, key))
  if (index === -1) return bucketKeys.length - 1
  return index
}

export const getBucketIndexCeil = (value: number, bucketKeys: string[]) => {
  const index = bucketKeys.findIndex((key) => parseFloat(key) >= value)
  if (index === -1) return bucketKeys.length - 1
  return index
}

export const nonDefaultFilter = (
  entry: [string, unknown],
  defaults: Filters
) => {
  const [key, value] = entry
  if (key.startsWith('raw.')) return Array.isArray(value) && value.length > 0
  // Skip if key doesn't exist in defaults of AdvancedFilters
  if (!(key in defaults)) return false
  const defaultValue = defaults[key as keyof Filters]
  if (
    typeof value !== 'undefined' &&
    typeof value !== 'object' &&
    value != defaultValue
  ) {
    return true
  } else if (Array.isArray(value)) {
    // A single-element array equal to the string default is treated as default
    // e.g. ['allListings'] when default is 'allListings'
    if (value.length === 1 && value[0] == defaultValue) return false
    // Any array with at least one truthy value is non-default
    return value.filter(Boolean).length > 0
  }
  return false
}

// Active filters with no UI in the current tenant — neither a base control nor
// any configured advanced/bar slot. Returned so they can be displayed and removed.
export const getUnknownFilters = (
  filters: Filters
): { key: keyof Filters; value: unknown }[] => {
  const defaults = { ...defaultAdvancedFilters, ...defaultFilters }
  const slotKeys = new Set<keyof Filters>(
    [...advancedFilterSlots, ...(barFilterSlots ?? [])].flatMap(
      (slot) => slotFields[slot]
    )
  )

  return Object.entries(filters)
    .filter(([key, value]) => {
      const filterKey = key as keyof Filters
      if (
        key.startsWith('raw.') ||
        knownFilterKeys.has(filterKey) ||
        slotKeys.has(filterKey)
      )
        return false
      return nonDefaultFilter([key, value], defaults)
    })
    .map(([key, value]) => ({ key: key as keyof Filters, value }))
}

export const countAdvancedFilters = (
  filters: Filters,
  slots: readonly AdvancedFilterSlot[] = advancedFilterSlots
) => {
  const activeFields = slots.flatMap((slot) => slotFields[slot])
  let counter = 0
  activeFields.forEach((field) => {
    if (nonDefaultFilter([field, filters[field]], defaultAdvancedFilters))
      counter += 1
  })
  // Unknown filters have no slot but still count toward the advanced badge, as does
  // every raw field holding a selection.
  return (
    counter +
    getUnknownFilters(filters).length +
    selectedRawFields(filters).length
  )
}

export const countAiQualityFilters = (filters: Filters) => {
  let counter = 0
  Object.entries(filters).forEach(([key, value]) => {
    if (
      key.indexOf('Quality') !== -1 &&
      Boolean(value) // truthy value
    ) {
      counter += 1
    }
  })

  return counter
}

export const extractGeoFilters = (location: ApiLocation): Partial<Filters> => {
  const { type, address } = location
  const area = address?.area

  const city =
    type === 'city' || type === 'neighborhood' ? address?.city : undefined

  const neighborhood =
    type === 'neighborhood' ? address?.neighborhood : undefined

  return {
    ...(area ? { area } : {}),
    ...(city ? { city } : {}),
    ...(neighborhood ? { neighborhood } : {})
  }
}

// A city standing for a listing area (`areaCities`) is queried by that area: REBNY's
// Brooklyn is `area=Kings`, its listings' `city` is "New York City".
export const cityGeoFilters = (city: string) => {
  const { areaCities } = locationConfig
  const area = Object.keys(areaCities).find((key) => areaCities[key] === city)
  return area ? { area } : { city }
}

export const toFilterArray = (
  value: string | string[] | undefined
): string[] => {
  return [value || ''].flat().filter(Boolean)
}

/**
 * Removes geo-filters that are already included in location path
 * If location="Calgary|Downtown", removes area="Calgary" and city="Downtown"
 */
export const deduplicateGeoFilters = (filters: Filters): Filters => {
  if (!filters.location) return filters

  const locationPaths = toFilterArray(filters.location)
  if (!locationPaths.length) return filters

  // Convert all geo-filters to arrays once
  const areas = toFilterArray(filters.area)
  const cities = toFilterArray(filters.city)
  const hoods = toFilterArray(filters.neighborhood)

  // Parse all location paths and remove matching geo-filters
  locationPaths.forEach((path) => {
    const { area, city, neighborhood } = parseLocationPath(path)
    const areaIdx = areas.indexOf(area!)
    const cityIdx = cities.indexOf(city!)
    const hoodIdx = hoods.indexOf(neighborhood!)
    if (areaIdx !== -1) areas.splice(areaIdx, 1)
    if (cityIdx !== -1) cities.splice(cityIdx, 1)
    if (hoodIdx !== -1) hoods.splice(hoodIdx, 1)
  })

  return { ...filters, area: areas, city: cities, neighborhood: hoods }
}
