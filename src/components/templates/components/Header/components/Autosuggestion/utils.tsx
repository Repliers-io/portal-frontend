import {
  type ApiBoardCity,
  type ApiNeighborhood,
  type AutosuggestionOption,
  type MapboxAddress,
  type Property
} from 'services/API'
import { formatShortAddress } from 'utils/properties'
import { capitalize, joinNonEmpty } from 'utils/strings'

export const getListingLabel = (option: AutosuggestionOption) => {
  const { source } = option || {}
  const { address } = (source as Property) || {}
  const { city } = address
  return joinNonEmpty([
    formatShortAddress(address),
    capitalize(String(city || '').trim())
  ])
}

export const getAreaLabel = (option: AutosuggestionOption) => {
  const { source, parent } = option
  const { name } = source as ApiNeighborhood
  const { name: parentName } = (parent as ApiBoardCity) || {}

  return joinNonEmpty([name, parentName])
}

export const getAddressLabel = (option: AutosuggestionOption) => {
  const { source } = option
  const { name, place } = source as MapboxAddress

  return joinNonEmpty([name, place.name])
}

export const removeQueryParam = () => {
  const strippedUrl = window.location.href.replace(
    /([?&])q=[^&#]*(&)?/,
    (match, p1, p2) => (p2 ? p1 : '')
  )
  return strippedUrl
}

// WARN: we have to go with RegEx approach due to the nature of our map URLs
// where we store coords as unnamed query param AND allow it to contain
// non encoded characters, e.g. /search/map?123.456,-789.012&z=16&q=some%20query
// We also always add 'z' as the second param, but url parsers tend to sort query
// params alphabetically

export const updateQueryParam = (newQuery: string) => {
  const currentUrl = window.location.href
  let updatedUrl

  if (/[?&]q=/.test(currentUrl)) {
    updatedUrl = currentUrl.replace(
      /([?&]q=)[^&#]*/,
      `$1${encodeURIComponent(newQuery)}`
    )
  } else {
    const separator = currentUrl.includes('?') ? '&' : '?'
    updatedUrl = currentUrl + `${separator}q=${encodeURIComponent(newQuery)}`
  }

  return updatedUrl
}
