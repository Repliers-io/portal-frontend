import { type Position } from 'geojson'
import { type LngLatBounds, type LngLatLike } from 'mapbox-gl'
import queryString from 'query-string'

import locationConfig from '@configs/location'
import { booleanPointInPolygon } from '@turf/turf'

import { type TransactionType } from 'services/Search'
import { extractGeoFilters } from 'utils/filters'
import { logError } from 'utils/log'
import { getBoundaryBounds, toMapboxBounds } from 'utils/map'
import { getSessionToken } from 'utils/tokens'

const normalizeBoundary = (raw: unknown): Position[][][] | undefined => {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  // Position[][][] — outer element is array of polygons (arrays of rings)
  if (Array.isArray(raw[0]?.[0]?.[0])) return raw as Position[][][]
  // Position[][] — single polygon (array of rings), wrap it
  if (Array.isArray(raw[0]?.[0])) return [raw as Position[][]]
  return undefined
}

import { APIBase, stringifyOptions } from './APIBase'
import { APISearch } from './APISearch'
import { toMultiPolygon } from './locationsToGeoJson'
import {
  type ApiAutosuggestResponse,
  type ApiGeoFilters,
  type ApiLocation,
  type ApiLocationsRequest,
  type ApiLocationsResponse,
  type ApiLocationWithBounds,
  type LiveByDemographicsLocation,
  type LocationDataSource,
  locationTypes
} from './types'

class APILocationsClass extends APIBase {
  /**
   * Fetches locations from the API with optional filters.
   *
   * Note: Due to raw/incorrect data from the server, the API sometimes returns
   * duplicate locations with the same type and name but different locationIds.
   * This method deduplicates results by keeping only the first occurrence of each
   * unique locationId, preferring locations with map.boundary.
   *
   * @param params - Optional location query parameters
   * @returns ApiLocationsResponse with deduplicated locations or null on error
   */
  async fetch(params: ApiLocationsRequest = {}, options?: RequestInit) {
    const defaults = {
      pageNum: 1,
      resultsPerPage: 300,
      // Restrict to geo types only for discovery queries. A `locationId` lookup
      // must NOT be type-restricted: the id resolves across sources (MLS +
      // LiveBy) and may be any type (school, district, postalCode…) — the API
      // returns it with its boundary. Sending the geo-type default here drops
      // school/LiveBy ids on reload (empty result → no MapTitle, no polygon).
      ...(params.locationId ? {} : { type: ['area', 'city', 'neighborhood'] }),
      fields: ['locationId', 'name', 'type', 'map', 'address'].join(',')
    }

    // The effective source — the tenant's `@configs/location` `source` — echoed
    // back on every location via the requested `source` field below.
    //
    // EXCEPTION: a `locationId` lookup must NOT pin a source. Location ids are
    // source-namespaced (MLS / LiveBy / …) and the API resolves a bare id across
    // ALL sources, returning the matching location WITH its boundary. Pinning the
    // default source drops cross-source ids on reload — a LiveBy hood queried
    // under `source=MLS` comes back `count: 0`, so the MapTitle and its polygon
    // vanish. The URL may even carry ids from several sources at once (each is
    // fetched individually), so no single source is correct. An explicit
    // `params.source` still wins when a caller provides one.
    const source = (params.source ??
      (params.locationId ? undefined : locationConfig.source)) as
      | LocationDataSource
      | undefined

    // Request `source` as a field even when a caller overrides `fields` (e.g.
    // overlay fetches), so every returned location carries its source.
    const requestedFields = params.fields ?? defaults.fields
    const fieldsStr = Array.isArray(requestedFields)
      ? requestedFields.join(',')
      : String(requestedFields)
    const fields = fieldsStr.split(',').includes('source')
      ? fieldsStr
      : `${fieldsStr},source`

    const query = queryString.stringify(
      {
        ...defaults,
        ...params,
        // `undefined` for a `locationId` lookup, which `stringifyOptions.skipNull`
        // drops — so no source is sent and the id resolves across sources
        source,
        fields
      },
      stringifyOptions
    )

    try {
      const response = await this.fetchJSON<ApiLocationsResponse>(
        `/locations?${query}`,
        options
      )

      if (!response?.locations) return response

      // Deduplicate locations by locationId+type (server may return duplicates)
      // Same locationId but different type = different entity (e.g. Toronto is both area and city)
      // Prefer locations with map.boundary, keep first occurrence with boundary if multiple exist
      const unique = new Map<string, ApiLocation>()
      response.locations.forEach((location) => {
        const key = `${location.locationId}::${location.type}`
        if (location.map?.boundary) {
          location.map.boundary = normalizeBoundary(location.map.boundary)
        }
        const existing = unique.get(key)

        if (!existing) {
          // First occurrence - always add
          unique.set(key, location)
        } else if (!existing.map?.boundary && location.map?.boundary) {
          // Replace existing without boundary with one that has boundary
          unique.set(key, location)
        }
        // If existing has boundary, keep it (ignore current location)
      })
      const locations = Array.from(unique.values())

      return {
        ...response,
        locations,
        count: locations.length
      }
    } catch (error) {
      logError('[APILocations] error fetching data', error)
      return null
    }
  }

  /**
   * Bounds for a single ApiLocation that has no boundary polygon, from the search
   * cluster aggregates. Used to fit the map to a point-only location (chip
   * recenter / autosuggest click / URL-loaded location without a boundary).
   *
   * Prefers the exact `locationId` — the SAME id the listings filter by — so the
   * bounds match the results (e.g. an MLS neighborhood centroid recenters onto its
   * own listings). The geo-filter path (area/city/neighborhood names via
   * `extractGeoFilters`) is a **deprecated fallback**, kept only for locations that
   * carry no native id (legacy URL name-paths) or external overlay ids: a name can
   * resolve a different same-named location (wrong city/source).
   *
   * @param location - ApiLocation (its `locationId` is preferred; address is the fallback)
   * @returns LngLatBounds for map fitBounds() or null if not found
   */
  async fetchLocationBounds(
    location: ApiLocation
  ): Promise<LngLatBounds | null> {
    // External ids aren't Repliers filters and can't constrain the search, so
    // they (and any id-less location) fall through to the geo-filter fallback.
    const get =
      !location.external && location.locationId
        ? { locationId: [location.locationId] }
        : extractGeoFilters(location)

    // No usable constraint — an unfiltered aggregate would return the whole
    // dataset's bounds, so bail instead of recentering on the entire region.
    if (!Object.keys(get).length) return null

    const response = await APISearch.fetch(
      { get: { ...get, listings: false, aggregates: 'map' } },
      { next: { revalidate: 86400 } }
    )

    const { bounds } = response?.aggregates?.map?.clusters?.[0] || {}
    return bounds ? toMapboxBounds(bounds) : null
  }

  /**
   * Fetches multiple locations by geo-filters and ensures each has bounds.
   * Returns array of locations with their LngLatBounds for map display.
   *
   * Use case: MapOptionsProvider fetching locations from URL parameters
   * Example: ?location=Calgary\Downtown&location=Edmonton
   *
   * If location has no boundary polygon:
   * - Fetches from search API using geo-filter (area/city/neighborhood)
   * - Uses cluster bounds from aggregates
   *
   * @param geoFilters - Object with area/city/neighborhood filters
   * @returns Array of locations with bounds (null if not found)
   */
  async fetchWithBounds(
    geoFilters: ApiGeoFilters
  ): Promise<ApiLocationWithBounds[]> {
    try {
      const params: ApiLocationsRequest = { ...geoFilters }

      // Only add type filter for geo-type filters (area/city/neighborhood)
      const types = locationTypes.filter((type) => geoFilters[type])
      if (types.length > 0) params.type = types

      const response = await this.fetch(params)

      if (!response?.locations?.length) {
        return []
      }

      // Process each location and add bounds if missing
      const locationsWithBounds = await Promise.all(
        response.locations.map(async (location) => {
          // With a boundary the extent is already resolved — derive bounds right
          // here, no second call.
          if (location.map?.boundary) {
            return {
              ...location,
              bounds: getBoundaryBounds(location.map.boundary)
            }
          }

          // Point-only (e.g. an MLS neighborhood centroid) — the location carries
          // no extent, so its bounds come from aggregating its listings
          // (fetchLocationBounds, id-first). This is a map-fit helper only: it does
          // NOT gate the listings search — a native `locationId` searches by id
          // regardless (only external ids wait on a resolved boundary polygon).
          const bounds = await this.fetchLocationBounds(location)
          return { ...location, bounds }
        })
      )

      return locationsWithBounds
    } catch {
      return []
    }
  }

  /**
   * The LiveBy neighborhood a point lies in, with its demographics — null when it
   * has no population (a park carries no census data, every field null).
   *
   * The API orders by centroid distance, and the nearest centroid can be a
   * neighbor's: a Park Avenue listing is nearer Central Park's than the Upper East
   * Side's. So the smallest candidate containing the point wins (the most specific
   * of nested neighborhoods), the nearest one as the fallback.
   */
  async fetchLiveByDemographics(lat: number, long: number) {
    const response = await this.fetch({
      source: 'LiveBy',
      type: 'neighborhood',
      lat,
      long,
      fields: 'locationId,name,type,subType,address,map,size,demographics',
      radius: 500,
      resultsPerPage: 20
    })
    const locations = (response?.locations ??
      []) as LiveByDemographicsLocation[]
    const [location = locations[0]] = locations
      .filter(
        ({ map }) =>
          map?.boundary &&
          booleanPointInPolygon([long, lat], toMultiPolygon(map.boundary))
      )
      .sort((a, b) => (a.size ?? 0) - (b.size ?? 0))
    return location?.demographics?.population ? location : null
  }

  async autosuggest(
    q: string,
    center?: LngLatLike | null,
    radius?: number,
    type?: TransactionType
  ) {
    // Send the tenant's own location source so the `/autosuggest` locations block
    // matches its map overlays (e.g. movesmartly → `UserDefined`). Omitted for `MLS`
    // tenants — MLS is the endpoint's default, so there is nothing to restrict.
    const { lat, lng: long } = (center as { lat?: number; lng?: number }) || {}
    const source =
      locationConfig.source !== 'MLS' ? locationConfig.source : undefined
    const defaults = {
      boundary: true,
      mapboxSearchSession: getSessionToken(),
      ...(source ? { source } : {}),
      ...(center ? { lat, long } : {}),
      ...(radius ? { radius } : {}),
      ...(type ? { type } : {})
    }

    const query = queryString.stringify({ ...defaults, q }, stringifyOptions)

    try {
      const response = await this.fetchJSON<ApiAutosuggestResponse>(
        `/autosuggest?${query}`
      )

      return response
    } catch (error) {
      logError('[APILocations] error fetching data', error)
      return null
    }
  }

  /**
   * Every page of a locations query, or an error — never a partial list.
   *
   * `fetch` reports a failed request as `null`, and treating that as the end of
   * the list is how a half-fetched tree used to reach `locations.json` without a
   * single warning: one 503 on page 3 and the cache silently kept two pages out
   * of four. A page that never arrived is a failure, and the caller (the cache
   * generator) must fail with it rather than write an incomplete tree.
   */
  async fetchAllPages(params: ApiLocationsRequest): Promise<ApiLocation[]> {
    const locations: ApiLocation[] = []
    let pageNum = 1
    let hasMorePages = true

    while (hasMorePages) {
      const response = await this.fetch({
        ...params,
        pageNum,
        resultsPerPage: 300
      })

      if (!response) {
        throw new Error(`[APILocations] locations page ${pageNum} failed`)
      }

      if (!response.locations?.length) {
        if (pageNum < response.numPages) {
          throw new Error(
            `[APILocations] locations page ${pageNum} of ${response.numPages} came back empty`
          )
        }
        break
      }

      locations.push(...response.locations)

      hasMorePages = pageNum < response.numPages
      pageNum++
    }

    return locations
  }
}

export const APILocations = new APILocationsClass()
