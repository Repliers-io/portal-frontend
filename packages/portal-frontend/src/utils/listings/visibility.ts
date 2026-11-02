import listingsConfig from '@configs/listings'

import { type ApiListing } from 'services/API'

const { guestGate, hiddenPriceFlags } = listingsConfig

const flag = (listing: ApiListing, name: string) => Boolean(listing.raw?.[name])

export const displayPublic = (listing: ApiListing) =>
  listing.permissions?.displayPublic === 'Y'

// a pinned private-board listing stays public when the tenant says so
export const restricted = (listing: ApiListing) =>
  !displayPublic(listing) &&
  !(guestGate.pinnedPublic && flag(listing, 'is_pinned'))

export const restrictedToGuest = (listing: ApiListing, logged?: boolean) =>
  !logged &&
  (restricted(listing) ||
    (guestGate.exclusive && flag(listing, 'exclusive')) ||
    (guestGate.offMarket && listing.status !== 'A'))

// a listing whose price the brokerage withholds, whatever its status
export const hiddenPrice = (listing: ApiListing) =>
  hiddenPriceFlags.some((name) => flag(listing, name))
