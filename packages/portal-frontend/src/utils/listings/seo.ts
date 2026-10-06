import listingsConfig from '@configs/listings'
import routes from '@configs/routes'
import searchConfig from '@configs/search'

import { type ApiListing } from 'services/API'
import { formatEnglishPrice } from 'utils/formatters'
import {
  capitalize,
  joinNonEmpty,
  pluralize,
  removeDuplicates
} from 'utils/strings'

import { formatShortAddress, formatTitleAddress } from './formatters'
import { sanitizeAddress, sanitizeScrubbed } from './sanitizers'
import {
  getBathrooms,
  getBedrooms,
  getLotSize,
  getSqft,
  land,
  premium,
  rent,
  scrubbed,
  sold
} from '.'

const { defaultBoardId } = searchConfig

/**
 * @description Board to fetch or link a listing's detail record with: the
 * listing's own board when the tenant addresses that board explicitly
 * (`searchConfig.distinctBoardIds`), the default read board otherwise. The API
 * can return `boardId` as a number or a numeric string, so it is coerced before
 * matching. `distinctBoardIds` is read off the config object rather than a
 * destructured copy so tests can vary it per case.
 */
export const resolveBoardId = (listing: Partial<ApiListing>): number => {
  const boardId = Number(listing.boardId)

  return boardId && searchConfig.distinctBoardIds.includes(boardId)
    ? boardId
    : defaultBoardId
}

/**
 * @description Generates a SEO-friendly URL for a listing from its address and
 * MLS number. A listing routed to an explicitly addressed board carries that
 * board as a trailing `-{boardId}` segment, so a direct visit reads the record
 * the link was built from — including when that board is `defaultBoardId`, which
 * a tenant may list to keep every board visible in its URLs. Everything else
 * stays board-less and falls back to `defaultBoardId` on read. The PDP reads the
 * board back through `parseSeoUrl`/`parseParams`.
 * */
export const getSeoUrl = (
  listing: Partial<ApiListing>,
  options?: {
    image?: string
  }
): string => {
  const { address = {}, mlsNumber = '' } = listing
  const image = options?.image || listing.matchedImage

  const addr = sanitizeAddress(address as ApiListing['address'])
  const slug = addr ? `${addr}-${mlsNumber}` : mlsNumber

  const routedBoardId = resolveBoardId(listing)
  const seoUrlPath = searchConfig.distinctBoardIds.includes(routedBoardId)
    ? `${slug}-${routedBoardId}`
    : slug

  // The photo is named, not numbered: an index would have to survive the
  // scrubbed filtering the PDP applies to its own gallery, and no longer
  // exists in the image key at all.
  const queryString = image ? `?image=${encodeURIComponent(image)}` : ''

  return `${routes.listing}/${seoUrlPath}${queryString}`
}

// TODO: remove hardcoded strings and map propertyType to constants
export const getSeoType = (type: string | null): string =>
  (type || '')
    .replace('Family For Sale', 'Family House For Sale')
    .replace('Detached', 'Detached House')
    .replace('Residential', 'House')
    .replace('Lots and Land', 'Land')
    .replace('Condo/Co-Op', 'Condo')

// TODO: remove hardcoded strings and map propertyType to constants
export const getSeoStatus = (listing: ApiListing): string =>
  sold(listing) ? 'Sold' : rent(listing) ? 'For Rent' : 'For Sale'

const formatMlsLabel = (mlsNumber?: string) =>
  mlsNumber ? `MLS# ${sanitizeScrubbed(mlsNumber)}` : ''

// Compact, address-first title: "3816 B Evanston Avenue N, Seattle, WA 98103 | MLS# 2546317"
export const getCompactSeoTitle = (listing: ApiListing): string => {
  const { address, mlsNumber } = listing
  const { city, state, zip } = address

  const street = formatTitleAddress(address)
  const cityName = capitalize(sanitizeScrubbed(city).toLowerCase())
  const stateZip = joinNonEmpty(
    [sanitizeScrubbed(state).toUpperCase(), sanitizeScrubbed(zip)],
    ' '
  )
  const location = joinNonEmpty([street, cityName, stateZip], ', ')

  return joinNonEmpty([location, formatMlsLabel(mlsNumber)], ' | ')
}

export const getSeoTitle = (listing: ApiListing): string => {
  if (listingsConfig.titleFormat === 'compact')
    return getCompactSeoTitle(listing)

  const { address, listPrice, soldPrice, details, mlsNumber } = listing
  const { propertyType } = details
  const { neighborhood, city, area, state } = address

  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const lotSize = getLotSize(listing)

  const sqft = getSqft(listing)
  const sqftString = sqft.number ? sqft.label : ''
  const lotSizeString = land(listing) && lotSize.number ? lotSize.label : ''

  // NOTE: we check for the _total_ number/count of beds and baths
  // but insert _string_ values of them (labels), which could have the formulae
  // of regular and small-size amenities, ex: `0+1` or `3+1`
  const bedsString = pluralize(beds.count, {
    one: `${beds.label} bed`,
    many: `${beds.label} beds`,
    zero: ''
  })

  const bathsString = pluralize(baths.count, {
    one: `${baths.label} bath`,
    many: `${baths.label} baths`,
    zero: ''
  })

  const localAddress = formatShortAddress(address, true)
  const stateAddress = joinNonEmpty(
    removeDuplicates(
      [neighborhood, city, area, state].map((v) => sanitizeScrubbed(v))
    ),
    ', '
  )

  const luxury = premium(listing) ? 'Luxury' : ''

  const typeString = sanitizeScrubbed(getSeoType(propertyType))
  const statusString = getSeoStatus(listing)

  const welcomeMessage = joinNonEmpty(
    [luxury, typeString, statusString, 'in', stateAddress],
    ' '
  )

  const result = joinNonEmpty(
    [
      welcomeMessage,
      sold(listing)
        ? !scrubbed(soldPrice) && soldPrice
          ? formatEnglishPrice(soldPrice)
          : ''
        : !scrubbed(listPrice) && listPrice
          ? formatEnglishPrice(listPrice)
          : '',
      bedsString,
      bathsString,
      sqftString,
      lotSizeString,
      localAddress
    ],
    ', '
  )

  return joinNonEmpty([result, formatMlsLabel(mlsNumber)], ' | ')
}

export const parseSeoUrl = (url: string) => {
  const slugs = url.split('-')

  // A board in `distinctBoardIds` trails the MLS number as `-{board}`; a URL
  // without one reads defaultBoardId.
  const boardId = Number(
    (slugs.at(-1) || '').match(/^\d{1,3}$/)
      ? slugs.pop() || defaultBoardId
      : defaultBoardId
  )

  const mlsNumber = slugs.pop()

  // fallback for very short URLs
  if (slugs.length < 4) {
    return {
      address: capitalize(slugs.join(' ')),
      mlsNumber,
      boardId
    }
  }

  const code1 = slugs.at(-1) || ''
  const code2 = slugs.at(-2) || ''

  // canadian postal code: A1A 1A1  (letter-digit-letter, digit-letter-digit)
  const canadianPostal =
    /^[a-z]\d[a-z]$/.test(code2) && /^\d[a-z]\d$/.test(code1)
  // us postal code: 5 digits (12345)
  const usPostal = /^\d{5}$/.test(code1)

  let postalCode: string | undefined
  let rest: string[]
  if (canadianPostal) {
    postalCode = `${code2} ${code1}`.toUpperCase()
    rest = slugs.slice(0, -2)
  } else {
    postalCode = usPostal ? code1 : undefined
    rest = slugs.slice(0, -1)
  }

  const city = capitalize(rest.pop() || '')

  let unitNumber: string | undefined = undefined
  let streetNumber: string | undefined = undefined
  if (rest[0].length <= 4 && /^\d+$/.test(rest[1])) {
    // first part is a unit number
    unitNumber = rest[0].toUpperCase()
    streetNumber = rest[1]
  } else if (/^\d+$/.test(rest[0])) {
    streetNumber = rest[0]
  }

  rest = rest.slice(unitNumber ? 2 : 1)
  const streetSuffix = rest.pop() || ''
  const streetName = capitalize(rest.join(' '))

  return {
    unitNumber,
    streetNumber,
    streetName,
    streetSuffix,
    city,
    zip: postalCode,
    mlsNumber,
    boardId
  }
}
