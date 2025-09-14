import searchConfig from '@configs/search'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood,
  APISearch,
  type Property
} from 'services/API'
import SearchService, { type Filters, getListingFields } from 'services/Search'

import { activeCountLimit, maxDistance } from './_constants'
import {
  byDistance,
  calculateDistance,
  extractCities,
  extractHoods,
  extractLocation
} from './_utils'

export type CatalogItem = ApiBoardCity & {
  distance?: number
}

export const fetchListings = async ({
  area = '',
  city = '',
  hood = '',
  filters = {},
  page = 1
}: {
  area?: string
  city?: string
  hood?: string
  page?: number
  filters?: Partial<Filters>
}) => {
  let listings: Property[] = []
  let count = 0
  let listPrice = null

  const fetchParams = {
    area,
    city,
    neighborhood: hood,
    status: 'A',
    pageNum: page,
    resultsPerPage: searchConfig.pageSize,
    boardId: searchConfig.defaultBoardId,
    ...getListingFields(),
    ...filters
  }

  try {
    const response = await SearchService.fetch(fetchParams)
    if (response) {
      listings = response.listings
      count = response.count
      listPrice = response.statistics.listPrice
    }
  } catch (error) {
    console.error('[fetchListings] error', fetchParams, error)
  }

  return { listings, count, listPrice }
}

export const fetchLocations = async (
  city = '',
  neighborhood = ''
): Promise<ApiBoardArea[]> => {
  try {
    const response = await APISearch.fetchLocations({
      city,
      neighborhood,
      activeCountLimit
    })
    return response?.boards[0]?.classes[0]?.areas || []
  } catch (error) {
    console.error(
      `[fetchLocations] error "${city}" > "${neighborhood}"\n`,
      error
    )
  }
  return []
}

const distanceMapper = (currentLocation: ApiNeighborhood) => {
  return (item: ApiNeighborhood) => {
    if (!currentLocation) {
      return item as CatalogItem
    }
    if (!item || !item.location) {
      console.error('[fetchNearbyLocations EMPTY]', item)
      return item as CatalogItem
    }
    return {
      ...item,
      distance: calculateDistance(currentLocation!.location, item.location)
    } as CatalogItem
  }
}

const distanceFilter = (item: CatalogItem) =>
  item.distance! > 0 && item.distance! < maxDistance

export const fetchNearbyLocations = async (city: string, neighborhood = '') => {
  try {
    const response = await APISearch.fetchLocations({
      ...(neighborhood ? { city } : {}),
      // pass the city param if we are inside neighborhood page and
      // pass nothing to fetch nearby cities if we are at the root level
      activeCountLimit
    })

    const { areas } = response?.boards[0]?.classes[0] || {}
    const currentLocation = extractLocation(areas, city, neighborhood)
    const extractFunc = neighborhood ? extractHoods : extractCities

    return extractFunc(areas)
      .map(distanceMapper(currentLocation!))
      .filter(distanceFilter)
      .sort(byDistance)
  } catch (error) {
    console.error(
      `[fetchNearbyLocations ERROR] "${city}" > "${neighborhood}"\n`,
      error
    )
  }
  return []
}
