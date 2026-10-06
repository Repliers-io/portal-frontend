import { LngLatBounds } from 'mapbox-gl'

import locationConfig from '@configs/location'

import { type ApiLocation, APILocations, APISearch } from 'services/API'
import { calculateDistance } from 'utils/geo'

import {
  extractAllNeighborhoods,
  extractCities,
  extractNeighborhoods,
  findAreaByName,
  findCityByName,
  locationMatchKey as norm
} from './filters'
import { loadStaticTree } from './static'
import { type LocationWithDistance, type NearbyCandidate } from './types'

const toPoint = (map?: ApiLocation['map']) => {
  const lat = Number(map?.latitude)
  const lng = Number(map?.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

// Max concurrent search API requests during cluster-fallback enrichment.
const clusterFallbackConcurrency = 20

// Runs fn over items with at most poolSize concurrent executions.
// Preserves result order without artificial delays — suitable for ISR/runtime.
async function pooledMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  poolSize: number
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(poolSize, items.length) }, worker)
  )
  return results
}

/**
 * Neighbours of the current location, nearest first — a pass over the tree, no
 * request. Candidates span every city, so a neighbourhood of another city comes
 * back tagged with the city that owns it and links through it.
 */
function fetchNearbyLocations({
  city,
  hood,
  candidates,
  location
}: {
  city?: string
  hood?: string
  candidates: NearbyCandidate[]
  location?: ApiLocation
}): LocationWithDistance[] {
  const center = toPoint(location?.map)
  if ((!city && !hood) || !center) return []

  const self = (candidate: ApiLocation) =>
    location?.locationId
      ? candidate.locationId === location.locationId
      : norm(candidate.name) === norm(hood || city || '')

  return candidates
    .flatMap((candidate) => {
      const coords = toPoint(candidate.map)
      if (!coords || !candidate.name || self(candidate)) return []
      const distance = calculateDistance(center, coords)
      return distance <= locationConfig.nearbyRadius
        ? [{ ...candidate, distance }]
        : []
    })
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Fetches map coordinates for child locations (cities or neighbourhoods)
 * shown as hover links on a location page.
 *
 * Step 1 — single batch request: all names from the static tree are sent at
 * once so the API returns map data for every known location in one round-trip.
 *
 * Step 2 — cluster fallback: only for locations still missing a centre point
 * (latitude) after step 1 and in the tree. A search API request derives centre +
 * bounding box from cluster aggregates and builds a rectangular boundary polygon.
 */
async function fetchChildMapData(
  locations: ApiLocation[],
  { area, city }: { area?: string; city?: string }
): Promise<Map<string, ApiLocation>> {
  if (!locations.length) return new Map()

  const names = locations.map((l) => l.name)
  const type = city ? 'neighborhood' : 'city'

  // Step 1 — one request for all names
  const geoFilter = city
    ? { city, neighborhood: names }
    : area
      ? { area, city: names }
      : { state: locationConfig.stateFilter, city: names }

  const response = await APILocations.fetch(
    { type, ...geoFilter, resultsPerPage: names.length + 10 },
    { next: { revalidate: 86400 } }
  )
  const byName = new Map(
    (response?.locations ?? [])
      .filter((l) => l.name)
      .map((l) => [norm(l.name), l])
  )

  // Step 2 — cluster fallback, for locations left without a centre point. The
  // tree carries one for every node the generator could place, so this runs only
  // for the leftovers the API cannot resolve either.
  const needsFallback = locations.filter(
    (l) => !l.map?.latitude && !byName.get(norm(l.name))?.map?.latitude
  )

  if (needsFallback.length > 0) {
    const enriched = await pooledMap(
      needsFallback,
      async (location) => {
        const apiLocation = byName.get(norm(location.name))
        const { name } = location
        const searchGeo = city
          ? { city, neighborhood: name }
          : area
            ? { area, city: name }
            : { state: locationConfig.stateFilter, city: name }

        const searchResponse = await APISearch.fetch(
          { get: { ...searchGeo, listings: false, aggregates: 'map' } },
          { next: { revalidate: 86400 } }
        )
        const cluster = searchResponse?.aggregates?.map?.clusters?.[0]
        if (!cluster) return apiLocation || location

        const { top_left, bottom_right } = cluster.bounds
        const base = apiLocation || location

        return {
          ...base,
          bounds: new LngLatBounds(
            [top_left.longitude, bottom_right.latitude],
            [bottom_right.longitude, top_left.latitude]
          ),
          map: {
            latitude: cluster.location.latitude,
            longitude: cluster.location.longitude
          }
        }
      },
      clusterFallbackConcurrency
    )

    for (const l of enriched) {
      if (l.name) byName.set(norm(l.name), l)
    }
  }

  return new Map(
    locations
      .filter((l) => l.name)
      .map((l) => [norm(l.name), byName.get(norm(l.name)) || l])
  )
}

/* The tree carries a centre point but no polygon — this is where the current
 * location's boundary comes from, the one the header map draws and frames.
 */
async function fetchLocationMapData({
  city,
  hood,
  area
}: {
  city?: string
  hood?: string
  area?: string
}): Promise<ApiLocation | null> {
  if (!city && !hood) return null

  const type = hood ? 'neighborhood' : 'city'
  const geoFilter = hood ? { city, neighborhood: hood } : { city, area }

  const response = await APILocations.fetch(
    { type, ...geoFilter },
    { next: { revalidate: 86400 } }
  )
  if (!response?.locations?.length) return null

  const location = response.locations[0]

  if (location.map?.latitude || location.map?.boundary?.length) return location

  // Location has no map data — derive center from search API cluster aggregates,
  // same approach as APILocations.fetchLocationBounds used elsewhere in the codebase.
  const searchResponse = await APISearch.fetch(
    { get: { ...geoFilter, listings: false, aggregates: 'map' } },
    { next: { revalidate: 86400 } }
  )

  const cluster = searchResponse?.aggregates?.map?.clusters?.[0]
  if (!cluster) return location

  const { top_left, bottom_right } = cluster.bounds

  return {
    ...location,
    map: {
      ...location.map,
      latitude: (top_left.latitude + bottom_right.latitude) / 2,
      longitude: (top_left.longitude + bottom_right.longitude) / 2,
      point: location.map?.point ?? ''
    }
  }
}

export async function fetchLocationsData(params: {
  area?: string
  city?: string
  hood?: string
  cityMapData?: boolean
  mapCitiesFilter?: string[]
}) {
  const {
    area,
    city,
    hood,
    cityMapData: fetchCityMapData = false,
    mapCitiesFilter
  } = params
  const { tree } = await loadStaticTree()

  const areas = tree.areas

  const cities = area ? extractCities(tree, area) : extractCities(tree)
  cities.sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))

  let hoods: ApiLocation[] = []
  let location: ApiLocation | undefined

  if (city) {
    hoods = extractNeighborhoods(tree, city, area)

    if (hood) {
      location = hoods.find((h) => norm(h.name) === norm(hood))
    } else {
      const citiesData = extractCities(tree, area)
      const cityData = city ? findCityByName(citiesData, city) : undefined
      if (cityData) {
        location = cityData
      }
    }
  } else if (area) {
    // An area page has a location too, and it is the one that makes its listing
    // query work: the tree's area name is not what listings carry in
    // `address.area` (TRREB files "York Region" as "York"), so a query built
    // from the name returns nothing, while the node's locationId returns the
    // area's listings.
    location = findAreaByName(tree, area)
  }

  // At state level the cities list can contain hundreds of entries, which
  // would produce a URL that exceeds the API's length limit.
  // We only fetch coordinates for a limited set: either an explicit caller-
  // provided filter (e.g. buildings page passes only cities that have
  // buildings), or the top maxSeoCities cities by listing count.
  // No page renders more cities than that, so nothing is lost.
  const citiesForMapData = mapCitiesFilter
    ? cities.filter((c) => mapCitiesFilter.includes(c.name))
    : cities.slice(0, locationConfig.maxSeoCities)

  // Similarly, a city can have many neighborhoods (e.g. Toronto has 100+).
  // Cap the batch to avoid exceeding API URL length limits.
  const hoodsForMapData = hoods
    .slice()
    .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))
    .slice(0, locationConfig.maxSeoHoods)

  const [nearbies, enrichedLocation, childMapData, cityMapData] =
    await Promise.all([
      fetchNearbyLocations({
        city,
        hood,
        location,
        candidates: hood ? extractAllNeighborhoods(tree) : extractCities(tree)
      }),
      fetchLocationMapData({ area, city, hood }),
      fetchChildMapData(city ? hoodsForMapData : citiesForMapData, {
        area,
        city
      }),
      city && fetchCityMapData
        ? fetchChildMapData(citiesForMapData, { area })
        : Promise.resolve(new Map<string, ApiLocation>())
    ])

  if (enrichedLocation) {
    location = {
      ...enrichedLocation,
      activeCount: location?.activeCount || enrichedLocation.activeCount
    }
  }

  // Merge map coordinates and type from API into the static-tree arrays.
  // Static tree carries activeCount but no map data or type; API has both.
  // We preserve activeCount and add map + type fields from the API response.
  // API locationIds differ from static-tree locationIds — match by normalized name.
  const mergeMapData = (
    locations: ApiLocation[],
    data: Map<string, ApiLocation>
  ) =>
    locations.map((location) => {
      const apiLocation = data.get(norm(location.name))
      if (!apiLocation) return location

      return {
        ...location,
        type: apiLocation.type,
        // Field-wise: the cached node brings the centre, the API row adds the
        // boundary. Replacing the object would drop the centre for every row the
        // API returns without map data.
        map: apiLocation.map
          ? { ...location.map, ...apiLocation.map }
          : location.map
      }
    })

  return {
    areas,
    cities: mergeMapData(cities, city ? cityMapData : childMapData),
    hoods: mergeMapData(hoods, childMapData),
    nearbies,
    location
  }
}
