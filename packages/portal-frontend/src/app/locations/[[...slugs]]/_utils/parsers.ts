import filtersConfig, { type ListingType } from '@configs/filters'
import locationConfig from '@configs/location'
import searchConfig from '@configs/search'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'
import { beautify, sanitizeUrl } from 'utils/urls'

import {
  compoundPrefixes,
  condoValues,
  exactFilters,
  filterPrefixes,
  filterSuffixes
} from './constants'

const { listingTypes } = filtersConfig

export const filter = (segment: string) => {
  if (exactFilters.includes(segment)) return true

  // Dash-prefixes ('for-', 'sort-', 'below-'…) already encode a token boundary.
  // Bare vocabulary words ('condos', 'sold', 'land'…) must match a whole leading
  // token — plain startsWith would swallow city slugs ('landsdale', 'homeside').
  if (
    filterPrefixes.some((prefix) =>
      prefix.endsWith('-')
        ? segment.startsWith(prefix)
        : segment === prefix || segment.startsWith(`${prefix}-`)
    )
  ) {
    return true
  }

  // Numeric filters like '3-bedroom' / '2-baths' — the suffix must be its own
  // trailing token, or a town like Bath would classify as a filter.
  if (filterSuffixes.some((suffix) => segment.endsWith(`-${suffix}`))) {
    return true
  }

  // Compound segments like '2-bedrooms-houses-for-sale' where the marker sits
  // mid-segment. Only STRUCTURAL tokens ('for', 'under', 'bedrooms'…) qualify —
  // vocabulary nouns would swallow hood slugs ('beaver-creek-business-park').
  // Single tokens are fully handled above; without this guard the town of Bath
  // would match the 'bath' suffix token.
  const tokens = segment.split('-')
  if (tokens.length < 2) return false
  return tokens.some(
    (token) =>
      compoundPrefixes.includes(token) || filterSuffixes.includes(token)
  )
}

/**
 * Does this segment name an area the tenant writes in the city position, with
 * no `-area` marker? Compared through `sanitizeUrl`, the same builder the URL
 * came from. The list is passed in rather than read here so the rule can be
 * tested without depending on whichever tenant config the build generated.
 */
export const cityPositionArea = (segment: string, areas: string[]) =>
  areas.some((area) => sanitizeUrl(area) === segment)

const usZipRegex = /^\d{5}(-\d{4})?$/
const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][- ]\d[A-Za-z]\d$/

const zipCode = (segment: string) =>
  usZipRegex.test(segment) || canadianPostalRegex.test(segment)

const listingRegex = /^(.*)-(\d{5,8})(-(\d{1,3}))?$/
const listing = (segment: string) => listingRegex.test(segment)

function isCompoundTokens(a: string, b: string) {
  if (filterSuffixes.includes(b)) {
    return true
  }

  if (compoundPrefixes.includes(a)) {
    return true
  }

  if (a === 'new' && b === 'listings') {
    return true
  }

  return false
}

function parseFiltersSegment(segment: string) {
  const tokens = segment.split('-')
  const filters = [] as string[]

  while (tokens.length) {
    const a = tokens[0]
    const b = tokens[1]

    if (isCompoundTokens(a, b)) {
      filters.push(`${a}-${b}`)
      tokens.splice(0, 2)
    } else {
      filters.push(a)
      tokens.shift()
    }
  }

  return filters
}

export const parseUrlParams = (params: string[]) => {
  const initialState = {
    location: {
      state: locationConfig.stateFilter,
      area: '',
      city: '',
      neighborhood: '',
      zipCode: '',
      address: ''
    },
    filters: [] as string[],
    localAddress: '',
    listingId: '',
    boardId: '',
    unknowns: [] as string[]
  }

  const result = (params || []).reduce((acc, segment) => {
    if (filter(segment)) {
      acc.filters = parseFiltersSegment(segment)
    } else if (listing(segment)) {
      const match = segment.match(listingRegex)
      if (match) {
        acc.localAddress ||= beautify(match[1])
        acc.listingId ||= match[2]
        acc.boardId = match[4] || String(searchConfig.defaultBoardId)
      }
    } else if (zipCode(segment)) {
      acc.location.zipCode = beautify(segment).toUpperCase()
    } else if (
      locationConfig.showAreas &&
      !acc.location.area &&
      !acc.location.city &&
      (segment.endsWith('-area') ||
        cityPositionArea(segment, locationConfig.cityPositionAreas))
    ) {
      // Only read `-area` as the area marker on tenants that actually have area
      // pages; elsewhere the suffix is just part of a city/neighbourhood name.
      // The position check covers the tenants that do: getLocationUrl emits an area
      // URL as the FIRST segment only (it carries no city or hood), so a later
      // segment ending in " Area" — Central Area, Taylor Bay Area — stays a hood.
      // `cityPositionAreas` names the areas that drop the marker entirely, so
      // `/on/toronto/north-york` reads as area + city.
      acc.location.area = beautify(segment.replace(/-area$/, ''))
    } else if (!acc.location.city) {
      acc.location.city = beautify(segment)
    } else if (!acc.location.neighborhood) {
      acc.location.neighborhood = beautify(segment)
    } else {
      acc.unknowns.push(segment)
    }
    return acc
  }, initialState)
  return result
}

export const parseUrlPrice = (price: string) => {
  const cleanPrice = price
    .toLowerCase()
    .replace('below-', '')
    .replace('under-', '')
    .replace('above-', '')
    .replace('$', '')
    .replace(',', '')
  if (cleanPrice.includes('m')) {
    return 1_000_000 * toSafeNumber(cleanPrice.replace('m', ''))
  }
  if (cleanPrice.includes('k')) {
    return 1_000 * toSafeNumber(cleanPrice.replace('k', ''))
  }
  return toSafeNumber(cleanPrice)
}

export const parseUrlNumber = (string: string) => {
  return toSafeNumber(string.split('-')[0])
}

export const parseListingType = (filters: string[]) => {
  const base = filters.reduce((prev, cur) => {
    switch (cur) {
      // aliases
      case 'house':
      case 'houses':
      case 'home':
      case 'homes':
      case 'detached':
        return 'residential'
      // aliases
      case 'condos':
      case 'apartment':
      case 'apartments':
        return 'condo'
      case 'townhomes':
        return 'townhome'
      case 'semi':
        return 'semiDetached'
      case 'penthouses':
        return 'penthouse'
      case 'lofts':
        return 'loft'
    }
    // strict match
    if ((listingTypes as readonly string[]).includes(cur)) {
      return cur
    }
    return prev
    // default listingType
  }, 'allListings') as ListingType

  // Class-aware townhouse split for tenants whose `listingTypes` expose it: a
  // `townhomes` slug resolves to the class-scoped residential type, and a
  // `condos`+`townhomes` combo to the condo variant. Tenants without these keys
  // keep the class-agnostic `townhome`.
  if (base === 'townhome') {
    const types = listingTypes as readonly string[]
    if (
      types.includes('condoTownhome') &&
      condoValues.some((value) => filters.includes(value))
    ) {
      return 'condoTownhome'
    }
    if (types.includes('residentialTownhome')) {
      return 'residentialTownhome'
    }
  }

  return base
}

export const parseUrlFilters = (filters: string[]) => {
  const searchFilters: Partial<Filters> = {
    // defaults
    listingStatus: 'active',
    sortBy: 'createdOnDesc'
  }

  filters.forEach((filter) => {
    // string matches
    switch (filter) {
      // WARN: not sure we should give this option to users
      case 'sold':
        searchFilters.listingStatus = 'sold'
        break
      // WARN: not sure we should give this option to users
      case 'any':
      case 'all':
        searchFilters.listingStatus = 'all'
        break
      case 'for-lease':
      case 'for-rent':
        searchFilters.listingStatus = 'rent'
        break
    }

    if (filter === 'new') {
      searchFilters.minYearBuilt = new Date().getFullYear() - 5
    }

    // if (filter === 'open') {
    //   // eslint-disable-next-line prefer-destructuring
    //   searchFilters.minOpenHouseDate = new Date().toISOString().split('T')[0]
    // }

    // non strict equality
    if (filter.startsWith('sort-')) {
      searchFilters.sortBy = filter.replace('sort-', '') as ApiSortBy
    }
    if (filter.startsWith('below-') || filter.startsWith('under-')) {
      searchFilters.maxPrice = parseUrlPrice(filter)
    }
    if (filter.startsWith('above-')) {
      searchFilters.minPrice = parseUrlPrice(filter)
    }
    if (filter.includes('-bed')) {
      searchFilters.minBedrooms = parseUrlNumber(filter)
    }
    if (filter.includes('-bath')) {
      searchFilters.minBaths = parseUrlNumber(filter)
    }
    if (filter.includes('-garage')) {
      searchFilters.minGarageSpaces = parseUrlNumber(filter)
    }
    if (filter.includes('-parking')) {
      searchFilters.minParkingSpaces = parseUrlNumber(filter)
    }
  })

  // Rentals are distinguished by the MLS `type` field (lease), not propertyType.
  // A tenant config may default `type: 'sale'`, which wins over the
  // listingStatus-derived `type` in processParams and silently strips the rent
  // filter. Pin `type: 'lease'` so the rent query is sent correctly.
  if (searchFilters.listingStatus === 'rent') {
    searchFilters.type = 'lease'
  }

  return {
    ...searchFilters,
    listingType: parseListingType(filters)
  }
}
