import filtersConfig from '@configs/filters'

import { type ApiQueryParams, APISearch } from 'services/API'
import { processParams } from 'services/Search/adapter'
import { dedupeListings, markMatchedImage } from 'utils/listings'

import {
  getClusterParams,
  getDefaultRectangle,
  getListingFields
} from './params'

const { defaultFilters, statusFilters } = filtersConfig

/**
 * Base filters merged under every listing request. An explicit `mlsNumber`
 * (single or list) means "show exactly these listings", so the default map
 * rectangle and the status/type constraints are dropped — otherwise a requested
 * listing outside the default bounds or of a filtered-out type would vanish.
 * The `any` status fragment is merged because the API defaults to active-only
 * when no status is sent, which would hide a sold/off-market listing (for RESO
 * tenants the fragment is empty — the proxy widens to the allowed
 * standardStatus list itself).
 * A `radius` search (lat/long/radius) likewise carries its own geo-area, so the
 * default rectangle is dropped for it too (but the status/type defaults stay).
 */
const getBaseFilters = ({
  mlsNumber,
  radius
}: Partial<ApiQueryParams>): Partial<ApiQueryParams> => {
  const byMlsNumber = Array.isArray(mlsNumber)
    ? mlsNumber.length > 0
    : Boolean(mlsNumber)

  if (!byMlsNumber) {
    // A radius search (lat/long/radius) defines its own geo-area, so don't clip it
    // with the default map rectangle — keep the status/type defaults though.
    if (radius) return { ...defaultFilters }
    return { ...getDefaultRectangle(), ...defaultFilters }
  }

  const {
    listingStatus: _listingStatus,
    listingType: _listingType,
    ...rest
  } = defaultFilters
  return { ...rest, ...statusFilters.any }
}

class SearchService {
  private abortController: AbortController | undefined

  private disabled = false

  disableRequests() {
    this.disabled = true
    if (this.abortController) {
      this.abortController.abort('disableRequests')
    }
  }

  enableRequests() {
    this.disabled = false
  }

  async fetch(params: Partial<ApiQueryParams>, independent = false) {
    if (this.disabled) return Promise.reject()

    let signal: AbortSignal | undefined
    if (!independent) {
      // Abort any in-flight request before starting a new one.
      // Independent requests (e.g. widgets) opt out of this to avoid
      // cancelling each other when multiple widgets are on the same page.
      this.abortController?.abort('superseded')
      this.abortController = new AbortController()
      signal = this.abortController.signal
    }

    let response
    try {
      response = await APISearch.fetch({ ...processParams(params) }, { signal })
    } catch (error) {
      // A superseded request is routine — the newer search wins; resolve null,
      // which callers already treat as "no data". Real failures keep their cause.
      if (signal?.aborted) return null
      return Promise.reject(error)
    }

    // The same MLS can arrive at the top level and also inlined into a small
    // cluster — dedupe so each card/marker renders once. Marked here rather
    // than in SearchProvider, since grid pages past the first never reach it.
    if (response?.listings) {
      response.listings = dedupeListings(response.listings).map(
        markMatchedImage
      )
    }

    // everything is fine but the current user interaction
    // disabled fetches AFTER we started this request
    return this.disabled ? Promise.reject() : response
  }

  async fetchListings(params: Partial<ApiQueryParams>, independent = false) {
    return this.fetch(
      {
        ...getBaseFilters(params),
        ...params,
        ...getListingFields()
      },
      independent
    )
  }

  async fetchBounds(
    zoom: number,
    params?: Partial<ApiQueryParams>,
    independent = false
  ) {
    return this.fetch(
      {
        ...getBaseFilters(params ?? {}),
        ...params,
        ...getClusterParams(zoom),
        listings: false
      },
      independent
    )
  }
}

const searchServiceInstance = new SearchService()
export default searchServiceInstance
