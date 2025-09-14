import routes from '@configs/routes'
import searchConfig from '@configs/search'

import { type Property } from 'services/API'
import { formatEnglishPrice } from 'utils/formatters'
import {
  capitalize,
  joinNonEmpty,
  pluralize,
  removeDuplicates
} from 'utils/strings'

import { formatShortAddress } from './formatters'
import { sanitizeAddress } from './sanitizers'
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

/**
 * @description This function generates a SEO-friendly URL for a property.
 * It uses the property's address and MLS number to create a URL path.
 * The boardId is used as a query parameter.
 * */
export const getSeoUrl = (
  property: Partial<Property>,
  options?: {
    startImage?: number
    boardId?: number
  }
): string => {
  const { address = {}, mlsNumber = '' } = property
  const boardId = options?.boardId || property.boardId
  const startImage = options?.startImage || property.startImage

  const addr = sanitizeAddress(address as Property['address'])
  // Construct the URL path, conditionally adding the hyphen between addr and mlsNumber
  const seoUrlPath =
    (addr ? `${addr}-${mlsNumber}` : mlsNumber) + (boardId ? `-${boardId}` : '')

  const queryString = startImage ? `?startImage=${startImage}` : ''

  return `${routes.listing}/${seoUrlPath}${queryString}`
}

// TODO: remove hardcoded strings and map propertyType to constants
export const getSeoType = (type: string): string =>
  type
    .replace('Family For Sale', 'Family House For Sale')
    .replace('Detached', 'Detached House')
    .replace('Residential', 'House')
    .replace('Lots and Land', 'Land')
    .replace('Condo/Co-Op', 'Condo')

// TODO: remove hardcoded strings and map propertyType to constants
export const getSeoStatus = (property: Property): string =>
  sold(property) ? 'Sold' : rent(property) ? 'For Rent' : 'For Sale'

export const getSeoTitle = (property: Property): string => {
  const { address, listPrice, soldPrice, details } = property
  const { propertyType } = details
  const { neighborhood, city, area, state } = address

  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const lotSize = getLotSize(property)

  const sqft = getSqft(property)
  const sqftString = sqft.number ? sqft.label : ''
  const lotSizeString = land(property) && lotSize.number ? lotSize.label : ''

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
    removeDuplicates([neighborhood, city, area, state]),
    ', '
  )

  const luxury = premium(property) ? 'Luxury' : ''

  const typeString = getSeoType(propertyType)
  const statusString = getSeoStatus(property)

  const welcomeMessage = joinNonEmpty(
    [luxury, typeString, statusString, 'in', stateAddress],
    ' '
  )

  const result = joinNonEmpty(
    [
      welcomeMessage,
      sold(property)
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

  return result
}

const { defaultBoardId } = searchConfig

export const parseSeoUrl = (url: string) => {
  const slugs = url.split('-')

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
