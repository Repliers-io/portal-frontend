import { type ListingType, listingTypes } from '@configs/filters'
import defaultLocation from '@configs/location'
import { defaultBoardId } from '@configs/search'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'
import { capitalize } from 'utils/strings'

import { compoundPrefixes, filterPrefixes, filterSuffixes } from './_constants'

export const filter = (segment: string) => {
  return (
    filterPrefixes.some((prefix) => segment.includes(prefix)) ||
    filterSuffixes.some((suffix) => segment.includes(suffix))
  )
}

const usZipRegex = /^\d{5}(-\d{4})?$/
const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][- ]\d[A-Za-z]\d$/

const zipCode = (segment: string) =>
  usZipRegex.test(segment) || canadianPostalRegex.test(segment)

const listingRegex = /^(.*)-(\d{5,8})(-(\d{1,3}))?$/
const listing = (segment: string) => listingRegex.test(segment)

export const beautify = (label: string) =>
  capitalize(
    decodeURIComponent(
      label
        .replace('-area', '')
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, '')
        // Replace multiple dashes with single dash for word separators
        .replaceAll(/(-){3,}/g, ' - ')
        // Replace single dashes between non-spaces with space
        .replaceAll(/(\S)-+(\S)/g, '$1 $2')
    ).trim()
  )

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
      state: defaultLocation.stateCode,
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
        acc.boardId = match[4] || String(defaultBoardId)
      }
    } else if (zipCode(segment)) {
      acc.location.zipCode = beautify(segment).toUpperCase()
    } else if (!acc.location.area && segment.endsWith('-area')) {
      acc.location.area = beautify(segment)
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

export const parseListingType = (filters: string[]) =>
  filters.reduce((prev, cur) => {
    switch (cur) {
      // aliases
      case 'house':
      case 'houses':
      case 'home':
      case 'homes':
        return 'residential'
      // aliases
      case 'condos':
      case 'apartment':
      case 'apartments':
        return 'condo'
      case 'townhomes':
        return 'townhome'
    }
    // strict match
    if (listingTypes.includes(cur as ListingType)) {
      return cur
    }
    return prev
    // default listingType
  }, 'allListings') as ListingType

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

    // if (filter === 'open') {
    //   // eslint-disable-next-line prefer-destructuring
    //   searchFilters.minOpenHouseDate = new Date().toISOString().split('T')[0]
    // }

    // non strict equality
    if (filter.startsWith('sort-')) {
      searchFilters.sortBy = filter.replace('sort-', '') as ApiSortBy
    }
    if (filter.startsWith('below-')) {
      searchFilters.maxPrice = parseUrlPrice(filter)
    }
    if (filter.startsWith('above-')) {
      searchFilters.minPrice = parseUrlPrice(filter)
    }
    if (filter.includes('-bed')) {
      searchFilters.minBeds = parseUrlNumber(filter)
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

  return {
    ...searchFilters,
    listingType: parseListingType(filters)
  }
}
