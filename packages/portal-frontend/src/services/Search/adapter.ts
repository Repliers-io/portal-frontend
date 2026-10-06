import filtersConfig, { type ListingType } from '@configs/filters'

import { type ApiQueryParams, type RawQuery } from 'services/API'
import {
  containsRawValues,
  deduplicateGeoFilters,
  toFilterArray
} from 'utils/filters'
import { soldDateDesc } from 'utils/listings'
import { parseLocationPath } from 'utils/urls'

import { listingTypeDeclaration } from './listingTypeDeclaration'
import { type Transformers, transformers } from './transformers'

const arraysMatch = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false
  const sortedArr1 = [...arr1].sort()
  const sortedArr2 = [...arr2].sort()
  return sortedArr1.every((value, index) => value === sortedArr2[index])
}

const { unionListingTypes, rawFilters, soldPriceAndDate } = filtersConfig

export const getListingType = (
  propertyTypes: string[]
): ListingType | ListingType[] | undefined => {
  if (!propertyTypes?.length) return undefined

  const declaration = listingTypeDeclaration
  const keys = Object.keys(declaration) as ListingType[]

  // Exact match first — handles allListings and clean single-type selections
  for (const key of keys) {
    const params = declaration[key]
    if (
      params &&
      Array.isArray(params.propertyType) &&
      arraysMatch((params.propertyType as string[]).flat(), propertyTypes)
    ) {
      return key
    }
  }

  // No exact match — try to decompose into multiple types (multi-select)
  // Skip search-based overrides and allListings; they can't be reverse-mapped from propertyTypes alone
  const searchBased: string[] = ['penthouse', 'loft', 'allListings']
  const matched: ListingType[] = []
  const covered = new Set<string>()

  for (const key of keys) {
    if (searchBased.includes(key)) continue
    const params = declaration[key]
    if (!params || !Array.isArray(params.propertyType)) continue
    const keyTypes = (params.propertyType as string[]).flat()
    if (keyTypes.length === 0) continue
    // All of this key's property types must be present in input and not yet claimed
    if (
      keyTypes.every((t) => propertyTypes.includes(t)) &&
      !keyTypes.some((t) => covered.has(t))
    ) {
      matched.push(key)
      keyTypes.forEach((t) => covered.add(t))
    }
  }

  if (matched.length === 0) return undefined
  if (matched.length === 1) return matched[0]
  return matched
}

/**
 * Drops empty arrays / blank values from a listing-type declaration and flattens
 * its arrays, producing a single `RawQuery` (params inside AND together). An empty
 * result (a type that contributes no constraint) is filtered out by the caller.
 */
const toQueryGroup = (decl: Record<string, unknown>): RawQuery => {
  const group: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(decl)) {
    if (Array.isArray(value)) {
      const flat = [...new Set(value.flat(Infinity as 1))].filter(
        (v) => v != null && v !== ''
      )
      if (flat.length) group[key] = flat
    } else if (value != null && value !== '') {
      group[key] = value
    }
  }
  return group as RawQuery
}

/**
 * Expands selected listing types into one `RawQuery` per type — the building
 * blocks of a UNION. Used instead of the flat `deepExtend` merge when a tenant
 * opts into `unionListingTypes`: flattening ANDs every type's class/propertyType/
 * style together, which collapses cross-axis types (e.g. URBN `townhome` = style,
 * `residential` = propertyType) to their intersection instead of their union.
 */
export const listingTypeQueryGroups = (
  listingType: ListingType | ListingType[]
): RawQuery[] => {
  const keys = (
    Array.isArray(listingType) ? listingType : [listingType]
  ).filter(Boolean)
  return keys
    .map((key) => listingTypeDeclaration[key])
    .filter((decl): decl is Record<string, unknown> => Boolean(decl))
    .map(toQueryGroup)
    .filter((group) => Object.keys(group).length > 0)
}

/**
 * Writes the listing-type union into `params.queries` (mutates in place).
 *
 * Any class/propertyType/style left at the top level (an explicit user
 * selection) is AND-merged into every type branch — both to keep its constraint
 * and to avoid the API's top-level / in-query duplicate-param 400. A pre-existing
 * query union (e.g. external overlay polygons) is combined by cartesian product:
 * (O1∨O2) ∧ (T1∨T2) = ∨ over { Oi ∧ Tj }. Overlay keys (locationId/map) and type
 * keys (class/propertyType/style) are disjoint, so a spread ANDs them correctly.
 */
export const applyListingTypeUnion = (
  params: Partial<ApiQueryParams>,
  typeGroups: RawQuery[]
): void => {
  const shared: RawQuery = {}
  for (const key of ['class', 'propertyType', 'style'] as const) {
    const value = params[key]
    if (value != null) {
      shared[key] = value as RawQuery[string]
      delete params[key]
    }
  }
  const groups = typeGroups.map((type) => ({ ...shared, ...type }))
  const existing = params.queries ?? []
  params.queries = existing.length
    ? existing.flatMap((query) => groups.map((type) => ({ ...query, ...type })))
    : groups
}

const getTransformKeys = (params: Partial<ApiQueryParams>) =>
  Object.keys(params).filter(
    (key): key is keyof ApiQueryParams =>
      key in transformers && params[key as keyof ApiQueryParams] != null
  )

export const transformFilters = (
  keys: any[],
  params: Partial<ApiQueryParams>
) => {
  const options = { type: params.type }
  const result = keys.map((key: keyof ApiQueryParams) => {
    // wrap the value to array, if it's a string
    const value = typeof params[key] === 'string' ? [params[key]] : params[key]

    if (!transformers[key as Transformers]) {
      return { [key]: value }
    } else {
      if (typeof transformers[key as Transformers] === 'function') {
        return transformers[key as Transformers]?.(value, options)
      }
      return false
    }
  })

  return keys.map((key, index) => ({ ...result[index] }))
}

export const mergeFilters = (groups: Record<string, string>[]) => {
  const merged: Record<string, any> = {}
  groups.forEach((filters) => {
    const filterKeys = Object.keys(filters)

    filterKeys.forEach((filterKey) => {
      if (!merged[filterKey]) {
        merged[filterKey] = filters[filterKey]
      } else {
        merged[filterKey] = [...[merged[filterKey]], ...[filters[filterKey]]]
      }
    })
  })
  return merged
}

export const flattenFilterArrays = (filters: any) => {
  const flattened: Record<string, any> = {}

  Object.keys(filters).forEach((key) => {
    const value = filters[key]

    if (Array.isArray(value)) {
      flattened[key] = [...new Set(value.flat(Infinity))].sort()
    } else {
      flattened[key] = value
    }
  })
  return flattened
}

const removeKeys = (
  keys: (keyof ApiQueryParams)[],
  obj: Partial<ApiQueryParams>
) => {
  const newObj = { ...obj }
  keys.forEach((key) => delete newObj[key])
  return newObj
}

type ApiGetPostParams = {
  get: { [key: string]: unknown }
  post: { [key: string]: unknown }
}

const postKeys: (keyof ApiQueryParams)[] = [
  'imageSearchItems',
  'map',
  'queries'
]

/**
 * Expands location filter into geo-filters and removes location from output
 */
const expandLocationFilter = (params: Partial<ApiQueryParams>) => {
  const { location, ...rest } = params

  if (!location) return params

  // Deduplicate existing geo-filters against location paths
  const deduplicated = deduplicateGeoFilters(params as Partial<ApiQueryParams>)

  // Parse location paths and add to geo-filters
  const locationPaths = toFilterArray(location)
  const areas = toFilterArray(deduplicated.area)
  const cities = toFilterArray(deduplicated.city)
  const neighborhoods = toFilterArray(deduplicated.neighborhood)

  locationPaths.forEach((path) => {
    const { area, city, neighborhood } = parseLocationPath(path)
    if (area && !areas.includes(area)) areas.push(area)
    if (city && !cities.includes(city)) cities.push(city)
    if (neighborhood && !neighborhoods.includes(neighborhood))
      neighborhoods.push(neighborhood)
  })

  return {
    ...rest,
    area: areas,
    city: cities,
    neighborhood: neighborhoods
  }
}

export const createRequestGroups = (
  params: Partial<ApiQueryParams>
): ApiGetPostParams => {
  return Object.entries(params).reduce<ApiGetPostParams>(
    (acc, [key, value]) => {
      if (postKeys.includes(key as keyof ApiQueryParams)) {
        acc.post[key] = value
      } else {
        acc.get[key] = value
      }
      return acc
    },
    { post: {}, get: {} }
  )
}

// Sold results bounded by the sold price and ordered newest-sale first.
export const applySoldPriceAndDate = ({
  minPrice,
  maxPrice,
  sortBy,
  ...rest
}: Partial<ApiQueryParams>): Partial<ApiQueryParams> => ({
  ...rest,
  minSoldPrice: minPrice?.toString(),
  maxSoldPrice: maxPrice?.toString(),
  sortBy: sortBy === 'createdOnDesc' ? soldDateDesc : sortBy
})

export const processParams = (rawParams: Partial<ApiQueryParams>) => {
  //
  // Here lies Balin, Son of Fundin, Lord of Moria...
  //

  // `externalLocationId` is client-side only: external overlay selections are
  // resolved to polygons in `getSearchArea` (POST queries). Strip defensively so
  // a caller passing raw filters through can never leak it to the API.
  const params = rawFilters.contains
    ? containsRawValues(rawParams)
    : { ...rawParams }
  delete (params as Record<string, unknown>).externalLocationId

  // An AI search would otherwise move the matched photo to the front; keep the
  // MLS order, with `imagesScore` aligned to it. Repliers rejects `imagesOrder`
  // without an AI parameter to order by. `coverImage` is a Filters field, hence
  // the narrow cast.
  const { coverImage } = params as { coverImage?: string }
  if (params.imageSearchItems?.length || coverImage) {
    params.imagesOrder = 'original'
  }

  // A widget/CMS author may pass `radius` as a string shortcode (e.g. '1.6');
  // coerce it to a number so the typed `radius` stays honest. Repliers accepts
  // fractional km, so no rounding.
  if (params.radius != null) {
    const km = Number(params.radius)
    if (Number.isFinite(km)) params.radius = km
  }

  // Multi listing-type UNION: when the tenant opts in and 2+ types are selected,
  // each type becomes its own POST `queries` element (OR) instead of being
  // flattened into one top-level AND (see `listingTypeQueryGroups`). A single
  // type keeps the flat path — it needs no union and adds no cross-axis conflict.
  // `listingType` is removed here so its class/propertyType/style never reach the
  // top level (a param present inside `queries` cannot also sit at the top level —
  // the API rejects the duplicate with a 400).
  // `listingType` is a Filters field (a transformer key), not part of the
  // ApiQueryParams shape — read it through a narrow cast like the rest of the
  // transform pipeline does.
  const listingType = (params as { listingType?: ListingType | ListingType[] })
    .listingType
  const typeGroups =
    unionListingTypes && listingType ? listingTypeQueryGroups(listingType) : []
  const unionTypes = typeGroups.length >= 2
  if (unionTypes) delete (params as { listingType?: unknown }).listingType

  // This is the main logic of finding and transforming SOME items from
  // the params object, while passing the rest of the object properties as is.
  // We name those items `filters`, but it's not exactly what they are.

  // Step 1: Get keys to transform
  const transformKeys = getTransformKeys(params)

  // Step 2: Transform filters from the params object,
  // extracting them out to an array of groups of filters.
  const transformed = transformFilters(transformKeys, params)

  // Step 2.5: A sold/active range filter pins the status axis itself, so
  // `listingStatus` must not union into it. Both emit `status`/`lastStatus`, and
  // the merge below unions every shared key — "Sold within 30 days" against the
  // default `listingStatus: 'active'` would ask for status ['A','U'] with both
  // status vocabularies merged, handing back every active listing alongside the
  // sold ones. Only the status axis yields; the type axis it also carries stays.
  // Only a chosen range pins it: the advanced dialog applies both ranges as ''.
  // All three are Filters fields rather than ApiQueryParams ones, so they are
  // read through a narrow cast, as the rest of the transform pipeline does.
  const filterKeys = transformKeys as string[]
  const statusIndex = filterKeys.indexOf('listingStatus')
  const { soldRange, activeRange } = params as {
    soldRange?: string | string[]
    activeRange?: string | string[]
  }
  const rangeOwnsStatus =
    statusIndex >= 0 &&
    [soldRange, activeRange].some((range) => [range].flat()[0])

  if (rangeOwnsStatus) {
    const {
      status: _status,
      lastStatus: _lastStatus,
      standardStatus: _standardStatus,
      ...typeAxis
    } = transformed[statusIndex]
    transformed[statusIndex] = typeAxis
  }

  // Step 3: Merge filters from different groups into one object.
  const merged = mergeFilters(transformed)

  // Step 4: Flatten arrays inside the merged object and remove duplicates
  const flattened = flattenFilterArrays(merged)

  // Step 5: Remove keys that were transformed from the original params object
  // and replace them with the flattened object (of all processed filters)
  const remaining = removeKeys(transformKeys, params)

  // Step 6: Combine remaining (non-transformed) params with flattened (transformed) params.
  //
  // ⚠️  DANGER ZONE — read carefully before touching this.
  //
  // The naive merge was: `{ ...remaining, ...flattened }`
  // That means `flattened` always wins — including fields like `style` that are DERIVED
  // from `listingType` transformation (e.g. listingType=condo → style=['Condominium','Apartment',...]).
  //
  // Problem: if the user explicitly picks a style in the StyleFilter (e.g. style=['2-Storey']),
  // that value is in `remaining` — but it gets silently overwritten by the listingType-derived
  // `style` from `flattened`. The user's selection disappears without any error.
  //
  // Fix: explicit user-set fields (those NOT derived from transformation) must win over
  // anything produced by `flattened`. We track them in `explicitFields` and apply them last.
  //
  // WARNING — this has a subtle side-effect: any field that the user passes explicitly AND
  // that a transformer also outputs will ALWAYS prefer the user's value, even if the transformer
  // result would have been more correct. Known safe cases today: only `style`.
  // If you add a new transformer that outputs a field also present in Filters (e.g. `class`,
  // `propertyType`), check whether a user might set that field directly — if yes, the same
  // conflict will apply and this logic will silently suppress the transformer output.
  //
  // Do NOT simplify this back to `{ ...remaining, ...flattened }` without understanding
  // the explicit-field override above.
  const explicitFields = new Set(
    Object.keys(params).filter(
      (k) => !transformKeys.includes(k as keyof ApiQueryParams)
    )
  )
  const combined = {
    ...remaining,
    ...Object.fromEntries(
      Object.entries(flattened).filter(([k]) => !explicitFields.has(k))
    ),
    ...Object.fromEntries(
      Object.entries(remaining).filter(([k]) => explicitFields.has(k))
    )
  }

  // Step 7: Expand location filter into geo-filters and remove location
  const expanded = expandLocationFilter(combined)

  // Step 7.5: fold the listing-type union into `queries`.
  if (unionTypes) applyListingTypeUnion(expanded, typeGroups)

  // Step 8: split params into GET and POST objects. A tenant opting into
  // `soldPriceAndDate` gets a chosen sold range priced and ordered by the sale —
  // after the transformers, which floor `minPrice` at 1 and drop a 0 `maxPrice`.
  const groups = createRequestGroups(
    soldPriceAndDate && [soldRange].flat()[0]
      ? applySoldPriceAndDate(expanded)
      : expanded
  )

  return groups
}
