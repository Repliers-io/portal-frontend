import queryString from 'query-string'

import filtersConfig from '@configs/filters'
import listingsConfig from '@configs/listings'
import searchConfig from '@configs/search'

import {
  type ApiListing,
  type ApiListingHistoryResponse,
  type ApiSimilarResponse,
  type HistoryItemType
} from 'services/API'
import { getListingFields } from 'services/Search'
import { logError } from 'utils/log'

import { APIBase } from './APIBase'

const { listingDetailsParams } = filtersConfig

class APIListingDetailsClass extends APIBase {
  /**
   * Full detail record. For tenants with `extendedHistory` the property-level history is
   * read in parallel and replaces `listing.history` — the embedded array only covers the
   * board the record was read from. Both requests share the caller's abort signal.
   */
  async fetchListing(
    mlsNumber: string,
    boardId: number,
    options?: RequestInit
  ): Promise<ApiListing> {
    const searchParams = queryString.stringify({
      boardId,
      ...listingDetailsParams
    })
    const detail = this.fetchJSON<ApiListing>(
      `/listings/${mlsNumber}?${searchParams}`,
      options
    )

    if (!listingsConfig.extendedHistory) return detail

    const [listing, history] = await Promise.all([
      detail,
      this.fetchHistory(mlsNumber, options)
    ])

    return history.length ? { ...listing, history } : listing
  }

  /** Cross-board history of the property behind `mls`; empty on any failure. */
  private async fetchHistory(
    mlsNumber: string,
    options?: RequestInit
  ): Promise<HistoryItemType[]> {
    const searchParams = queryString.stringify({ mlsNumber })

    try {
      const response = await this.fetchJSON<ApiListingHistoryResponse>(
        `/listings/history?${searchParams}`,
        options
      )
      return response.history ?? []
    } catch (error) {
      // `fetchRaw` turns both an abort and a network failure into the same
      // `Response(null, 503)`, so this catch can't tell them apart from the error
      // alone. An aborted signal means the caller moved on (e.g. arrow-key
      // navigation cancelling the previous listing's requests) — not a failure.
      if (!options?.signal?.aborted) {
        logError('[ListingHistory] error fetching extended history', error)
      }
      return []
    }
  }

  async fetchSimilarListings(
    mls: string,
    boardId: number
  ): Promise<ApiSimilarResponse> {
    const { fields } = getListingFields()
    const searchParams = queryString.stringify({
      fields,
      boardId,
      radius: searchConfig.similarListingsRadius,
      sortBy: 'createdOnDesc',
      listPriceRange: '200000'
    })

    return this.fetchJSON<ApiSimilarResponse>(
      `/listings/${mls}/similar?${searchParams}`
    )
  }

  fetchLastUpdatedOn(): Promise<{ lastUpdatedOn: string | null }> {
    return this.fetchJSON('/listings/lastUpdatedOn')
  }
}

export const APIListingDetails = new APIListingDetailsClass()
