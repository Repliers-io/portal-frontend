import { resultsPerPage } from '@configs/search'
import { pageSize } from '@configs/search'

import { type Property } from 'services/API'

export const pagesInResponse = Math.ceil(resultsPerPage / pageSize)

export const slicePropertiesPerPage = (
  properties: Property[],
  clientPage: number
) => {
  // clientPage starts from 1
  const reminder = (clientPage - 1) % pagesInResponse
  const startIndex = reminder * pageSize
  const endIndex = startIndex + pageSize
  return properties.slice(startIndex, endIndex)
}

export const toServerPage = (clientPage: number) => {
  if (clientPage < 1)
    throw Error('clientPage should be greater than or equal to 1')
  return Math.floor((clientPage - 1) / pagesInResponse) + 1
}

// WARN: we have to go with RegEx approach due to the nature of our map URLs
// where we store coords as unnamed query param AND allow it to contain
// non encoded characters, e.g. /search/map?123.456,-789.012&z=16&q=some%20query
// We also always add 'z' as the second param, but url parsers tend to sort query
// params alphabetically

export const updatePageParam = (page: number) => {
  const currentUrl = window.location.search
  let updatedUrl

  const separator = currentUrl.includes('?') ? '&' : '?'
  const replacement = page < 2 ? '' : `${separator}page=${page}`

  if (/[?&]page=\d+/.test(currentUrl)) {
    updatedUrl = currentUrl.replace(/([?&]page=\d+)[^&#]*/, replacement)
  } else {
    updatedUrl = currentUrl + replacement
  }
  if (updatedUrl[0] === '&') updatedUrl = '?' + updatedUrl.substring(1)

  return updatedUrl
}
