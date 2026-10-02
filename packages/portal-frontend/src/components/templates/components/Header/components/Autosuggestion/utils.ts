import { type LngLatLike } from 'mapbox-gl'

import mapConfig from '@configs/map'

import { type ApiListing, type ApiLocation, APILocations } from 'services/API'
import { type MapboxAddress } from 'services/Map'
import { type TransactionType } from 'services/Search'
import { type MapPosition } from 'providers/MapOptionsProvider'
import { formatShortAddress } from 'utils/listings'
import { logError } from 'utils/log'
import { getPositionRadius } from 'utils/map'
import { capitalize, joinNonEmpty } from 'utils/strings'

export type AutocompleteOption =
  | ApiLocation
  | (MapboxAddress & { type: 'address' })
  | (ApiListing & { type: 'listing' })
  | { type: 'loader' }

const MAX_ITEMS_PER_TYPE = 5

const { mapboxDefaults, proximitySearch } = mapConfig

// Sort order for autocomplete option groups: most specific first
const TYPE_SORT_ORDER: Record<string, number> = {
  loader: 0,
  listing: 1,
  address: 2,
  neighborhood: 3,
  city: 4,
  area: 5
}

/**
 * Process locations from autocomplete response
 * - Deduplicate by name within each type, preferring items with map.boundary
 * - Limit to max 5 items per type
 */
export const processLocations = (locations: ApiLocation[]): ApiLocation[] => {
  // Group by type + name to find duplicates within same type
  const locationsByTypeAndName = new Map<string, ApiLocation[]>()

  locations.forEach((loc) => {
    const key = `${loc.type}:${loc.name || ''}`
    if (!locationsByTypeAndName.has(key)) {
      locationsByTypeAndName.set(key, [])
    }
    locationsByTypeAndName.get(key)!.push(loc)
  })

  // For each type+name, pick the one with boundary if available
  const uniqueLocations: ApiLocation[] = []

  locationsByTypeAndName.forEach((locs) => {
    if (locs.length === 1) {
      uniqueLocations.push(locs[0])
    } else {
      // Prefer location with boundary
      const withBoundary = locs.find((loc) => loc.map?.boundary)
      uniqueLocations.push(withBoundary || locs[0])
    }
  })

  // Group by type and limit to MAX_ITEMS_PER_TYPE items per type
  const byType = new Map<string, ApiLocation[]>()
  uniqueLocations.forEach((loc) => {
    if (!byType.has(loc.type)) {
      byType.set(loc.type, [])
    }
    const items = byType.get(loc.type)!
    if (items.length < MAX_ITEMS_PER_TYPE) {
      items.push(loc)
    }
  })

  // Flatten back to array
  const limitedLocations: ApiLocation[] = []
  byType.forEach((items) => limitedLocations.push(...items))

  return limitedLocations
}

/**
 * Get label for Location based on type:
 * - area: area name
 * - city: city name
 * - neighborhood: "neighborhood, city"
 */
export const getLocationLabel = (location: ApiLocation) => {
  const { type, name, address } = location
  let labelsArr: (string | undefined)[] = []

  if (type === 'area') labelsArr = [name, address?.state]
  if (type === 'city') labelsArr = [name, address?.state]
  if (type === 'neighborhood') labelsArr = [name, address?.city, address?.state]

  return joinNonEmpty(labelsArr)
}

export const getListingLabel = (listing: ApiListing) => {
  const { address } = listing || {}
  const { city } = address
  return joinNonEmpty([
    formatShortAddress(address),
    capitalize(String(city || '').trim())
  ])
}

export const getAddressLabel = (address: MapboxAddress) => {
  const { name, place } = address

  return joinNonEmpty([name, place.name])
}

/**
 * Get label for any autocomplete option based on type
 */
export const getOptionLabel = (option: string | AutocompleteOption): string => {
  if (!option || typeof option === 'string') return option || ''

  switch (option.type) {
    case 'area':
    case 'city':
    case 'neighborhood':
      return getLocationLabel(option as ApiLocation)
    case 'address':
      return getAddressLabel(option as MapboxAddress)
    case 'listing':
      return getListingLabel(option as ApiListing)
    default:
      return ''
  }
}

export const removeQueryParam = () => {
  const strippedUrl = window.location.href.replace(
    /([?&])q=[^&#]*(&)?/,
    (_match, p1, p2) => (p2 ? p1 : '')
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
    updatedUrl = currentUrl.replace(/([?&]q=)[^&#]*/, `$1${newQuery}`)
  } else {
    const separator = currentUrl.includes('?') ? '&' : '?'
    updatedUrl = currentUrl + `${separator}q=${newQuery}`
  }

  return updatedUrl
}

/**
 * Build options array for Autocomplete component
 */
export const buildAutocompleteOptions = ({
  loading,
  locations,
  addresses,
  listings
}: {
  loading: boolean
  locations: ApiLocation[]
  addresses: MapboxAddress[]
  listings: ApiListing[]
}): AutocompleteOption[] => {
  const result: AutocompleteOption[] = []

  if (loading) {
    result.push({ type: 'loader' })
  } else {
    // Add all locations (groupBy will automatically group them by type)
    locations.forEach((location) => {
      result.push(location)
    })

    addresses.forEach((address) => {
      result.push({
        ...address,
        type: 'address'
      })
    })

    listings.forEach((listing) => {
      result.push({
        ...listing,
        type: 'listing'
      })
    })
  }

  // Sort by type order: listing -> address -> neighborhood -> city -> area
  result.sort((a, b) => {
    const orderA = TYPE_SORT_ORDER[a.type] ?? 999
    const orderB = TYPE_SORT_ORDER[b.type] ?? 999
    return orderA - orderB
  })

  return result
}

export const getQueryCenterRadius = (position?: MapPosition) => {
  // Use proximity search (default center + 5000km) if zoom is too low or position is incomplete
  const zoom = position?.zoom || mapboxDefaults.zoom || 0
  const useProximitySearch =
    zoom < proximitySearch.zoomThreshold ||
    !position?.center ||
    !position?.bounds

  const center = useProximitySearch ? proximitySearch.center : position?.center
  const radius = useProximitySearch
    ? 5000
    : Math.round(getPositionRadius(position))

  return { center, radius }
}

/**
 * Fetch autosuggestions from API
 */
export const fetchAutosuggestions = async (
  query: string,
  center?: LngLatLike | null,
  radius?: number,
  type?: TransactionType
): Promise<{
  locations: ApiLocation[]
  listings: ApiListing[]
  addresses: MapboxAddress[]
}> => {
  const result: {
    locations: ApiLocation[]
    listings: ApiListing[]
    addresses: MapboxAddress[]
  } = {
    locations: [],
    listings: [],
    addresses: []
  }

  try {
    // No source param is sent from here: `/autosuggest` restricts its locations by
    // source per-instance on the backend (e.g. movesmartly → `UserDefined`), and its
    // Joi schema rejects unknown query keys. Results already carry their `source`.
    const response = await APILocations.autosuggest(query, center, radius, type)
    const { locations, mapbox, listings } = response || {}
    const processedLocations = locations?.locations?.length
      ? processLocations(locations.locations)
      : []

    return {
      locations: processedLocations,
      listings: listings?.listings || [],
      addresses: mapbox || []
    }
  } catch (error) {
    logError('[Autosuggestion] Failed to fetch autosuggestions:', error)
    return result
  }
}
