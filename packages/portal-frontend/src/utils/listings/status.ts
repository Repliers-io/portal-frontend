import listingsConfig from '@configs/listings'

import {
  type ApiLastStatus,
  type ApiListing,
  type ListingStatusGroup
} from 'services/API'

import { restricted, restrictedToGuest } from './visibility'

// listing lifecycle groups
const liveOnMarket: ApiLastStatus[] = [
  'New', // New
  'Pc', // Price Change
  'Ext' // Extension
]
// conditional sale/lease — a deal is accepted but not yet firm ("pending")
const pendingStatuses: ApiLastStatus[] = [
  'Sc', // Sold Conditionally
  'Sce', // Sold Conditionally with Escape Clause
  'Lc', // Leased Conditionally
  'Lce' // Leased Conditionally with Escape Clause
]
const dealClosed: ApiLastStatus[] = [
  'Sld', // Sold
  'Lsd' // Leased
]
const offMarket: ApiLastStatus[] = [
  'Sus', // Suspended
  'Exp', // Expired
  'Ter' // Terminated
]

export const active = (listing: ApiListing) =>
  listing.status === 'A' ||
  liveOnMarket.includes(listing.lastStatus) ||
  // sold filter maps Sc/Sce to status='U' — don't treat them as active there
  (listing.status !== 'U' && pendingStatuses.includes(listing.lastStatus))

// Sld, Lsd, Sus, Exp, Ter, Cs
export const sold = (listing: ApiListing) => !active(listing)

// conditional sale/lease: shown as sold but the deal is not yet firm
export const pending = (listing: ApiListing) =>
  pendingStatuses.includes(listing.lastStatus)

export const soldOrRented = (listing: ApiListing) =>
  dealClosed.includes(listing.lastStatus)

export const inactive = (listing: ApiListing) =>
  offMarket.includes(listing.lastStatus)

export const rent = (listing: ApiListing) => listing?.type === 'Lease'

// Status GROUP anchored on the always-present `status` (A/U), refined by
// `lastStatus` only when it survived scrubbing. `lastStatus` alone is unreliable —
// restricted listings ship it as '!scrubbed!' — so `status` decides on/Off Market,
// and a scrubbed or otherwise unclassified off-market listing stays the default
// off-market group: 'sold' (never 'sale').
export const factualStatusGroup = (listing: ApiListing): ListingStatusGroup => {
  if (listing.status === 'A') return rent(listing) ? 'rent' : 'sale'
  if (inactive(listing)) return 'inactive'
  return 'sold'
}

// status as shown to the viewer: guests see restricted listings as sold
export const resolveStatusGroup = (listing: ApiListing, logged?: boolean) =>
  restrictedToGuest(listing, logged) ? 'sold' : factualStatusGroup(listing)

export const getStatusLabel = (listing: ApiListing) => {
  if (sold(listing)) return 'Sold'
  if (restricted(listing)) return 'Restricted' // Sold must also be Restricted
  if (active(listing)) return 'Active'

  return 'Restricted' // This shall not happen in Real Life. Just catching improbable edge case
}

// Human label for a specific `lastStatus` code (e.g. 'Sc' → 'Sold Conditionally'),
// falling back to the raw code (covers the scrub placeholder). Distinct from
// getStatusLabel, which returns the coarse on/off-market group.
export const lastStatusLabel = (lastStatus: ApiLastStatus): string =>
  listingsConfig.statusLabels[lastStatus] || lastStatus

// The listing's days-on-market from the concrete API field: daysOnMarket for
// sold listings, simpleDaysOnMarket for active ones. Single source shared by the
// PDP header and the status-history current row so the two never diverge.
export const daysOnMarketCount = (listing: ApiListing): number =>
  Number(sold(listing) ? listing.daysOnMarket : listing.simpleDaysOnMarket)
