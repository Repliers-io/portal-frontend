/**
 * Owns the single listing being viewed: guest-restriction blur state and
 * similar/comparable listings (fetched for active, taken from comparables for sold).
 * Exposes `useListing` (read).
 * Anatomy: docs → product-guide/listing-detail/technical
 */
'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import features from '@configs/features'

import { type ApiListing, APIListingDetails } from 'services/API'
import { resolveBoardId, restrictedToGuest, sold } from 'utils/listings'
import { logError } from 'utils/log'

import { useUser } from './UserProvider'

type ListingContextProps = {
  community?: string
  listing: ApiListing
  blurred: boolean
  similarListings: ApiListing[]
}

export const ListingContext = createContext<ListingContextProps | undefined>(
  undefined
)

const ListingProvider = ({
  children,
  listing
}: {
  children: React.ReactNode
  listing: ApiListing
}) => {
  const { logged } = useUser()
  const { mlsNumber, boardId, comparables } = listing
  const detailsBoardId = resolveBoardId(listing)
  const soldListing = sold(listing)
  const blurred =
    features.blurRestrictedProperty && restrictedToGuest(listing, logged)

  const [similarListings, setSimilarListings] = useState<ApiListing[]>(
    soldListing && comparables?.length ? comparables : []
  )

  // NOTE: temporary wrapper around APIListingDetails "service", which will be deleted soon
  const fetchSimilarListings = useCallback(async () => {
    try {
      const response = await APIListingDetails.fetchSimilarListings(
        mlsNumber,
        detailsBoardId
      )
      // response from the server sometimes contains properties without mlsNumber
      const filtered = response.similar.filter((p) => Boolean(p.mlsNumber))
      setSimilarListings(filtered)
    } catch (e) {
      logError('[SimilarListings] error fetching data', e)
    }
  }, [detailsBoardId, mlsNumber])

  useEffect(() => {
    if (!soldListing) fetchSimilarListings()
  }, [mlsNumber, boardId])

  // `listing` must stay in the deps: the browser dialog swaps a sparse search
  // record for the full detail under the same mlsNumber/boardId, and consumers
  // (e.g. detailsAvailable in the nav bar) must see the richer object once it
  // arrives — keying only on mlsNumber/boardId would serve the stale record.
  const contextValue = useMemo(
    () => ({
      listing,
      blurred,
      similarListings
    }),
    [listing, blurred, similarListings]
  )

  return (
    <ListingContext.Provider value={contextValue}>
      {children}
    </ListingContext.Provider>
  )
}

export default ListingProvider

export const useListing = () => {
  const context = useContext(ListingContext)
  if (!context) {
    throw Error('useListing must be used within a ListingProvider')
  }
  return context
}
