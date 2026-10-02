import { badgeSurfaces } from '@configs/badgeSurfaces'
import features from '@configs/features'
import listingsConfig from '@configs/listings'

import { type ApiListing, type ListingStatusGroup } from 'services/API'

import { scrubbed } from '../formatters'

import { factualStatusGroup, pending } from './status'
import { restrictedToGuest } from './visibility'

// A status badge keys off a listing's status GROUP (sold/inactive/sale/rent) or
// the special 'pending' token (conditional sale/lease — see pending()). 'pending'
// is a status, not a group, so it is matched explicitly. 'offMarket' is
// resolve-time only (never listed in badgeSurfaces): the umbrella badge for an
// off-market listing whose redacted lastStatus hides whether it sold or died.
export type BadgeGroup = ListingStatusGroup | 'pending' | 'offMarket'

// Which groups show a badge on each card surface (the container a card renders in
// — see CardSurface). Opt-in per surface; empty/absent list = no badge.
export type BadgeSurfaces = Record<string, BadgeGroup[]>

// the group (or 'pending') to badge for a listing on a card surface, or null when
// hidden. Surface must be set and configured; guests never see restricted badges.
export const resolveBadge = (
  listing: ApiListing,
  surface: string | null,
  logged?: boolean
): BadgeGroup | null => {
  if (!surface) return null
  // A card a guest only sees blurred (sign-in gated) carries no status badge.
  if (features.blurRestrictedProperty && restrictedToGuest(listing, logged))
    return null
  const groups = badgeSurfaces[surface]
  if (!groups) return null
  // Pending (a conditional deal — accepted, not yet firm) is a first-class badge,
  // always labelled "Pending" (never the raw MLS "Sold Conditionally"), shown
  // wherever a surface badges sold. No per-tenant opt-in needed.
  if (
    pending(listing) &&
    (groups.includes('sold') || groups.includes('pending'))
  )
    return 'pending'
  // Badge the FACTUAL status (status-anchored), so genuinely sold/inactive
  // listings are labelled even for guests, while a restricted-but-active one is
  // never falsely "Sold".
  const group = factualStatusGroup(listing)
  if (!groups.includes(group)) return null
  // A scrubbed lastStatus hides whether the listing sold or was terminated —
  // claim only the honest umbrella, never "Sold".
  return group === 'sold' && scrubbed(listing.lastStatus) ? 'offMarket' : group
}

// A genuinely sold/inactive listing shows the precise MLS status label (e.g.
// "Sold Conditionally"), falling back to the generic group translation. Every
// other group — pending, offMarket, sale, rent — reads its label straight from
// i18n (`Listing.status.<group>`).
export const resolveBadgeLabel = (
  group: BadgeGroup,
  listing: ApiListing,
  t: (group: BadgeGroup) => string
): string =>
  group === 'sold' || group === 'inactive'
    ? (listingsConfig.statusLabels[listing.lastStatus] ?? t(group))
    : t(group)

// The status label for an off-market listing that is not a firm sale/lease: the
// precise MLS status (Terminated/Expired/Suspended) when visible, or the honest
// "Off Market" umbrella when the status is redacted for guests (a scrubbed
// lastStatus). Shared by the PDP header variants.
export const offMarketLabel = (
  listing: ApiListing,
  t: (group: BadgeGroup) => string
): string =>
  resolveBadgeLabel(
    scrubbed(listing.lastStatus) ? 'offMarket' : 'inactive',
    listing,
    t
  )
