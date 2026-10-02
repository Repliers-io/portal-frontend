import features from '@configs/features'
import { MeetingRoomIcon } from '@configs/icons'

import { type ApiListing } from 'services/API'
import {
  formatOpenHouseBadge,
  getQualityTag,
  type ListingTag,
  upcomingOpenHouses
} from 'utils/listings'

// Icon is a UI concern (MUI), so this lives at the component layer rather than
// in utils/listings — mirrors getQualityTag's shape: listing -> ListingTag | null.
const openHouseTag = (listing: ApiListing): ListingTag | null => {
  const next = upcomingOpenHouses(listing)[0]
  return next
    ? {
        label: formatOpenHouseBadge(next),
        color: 'success',
        icon: <MeetingRoomIcon />
      }
    : null
}

// Open-house and AI-quality overlay tags for a listing-card surface (grid card
// and map drawer). Lives in the card layer so the generic Tags component stays a
// pure renderer. Tolerates a nullish listing (the drawer's active listing may be
// null before the first open).
export const useListingTags = (listing?: ApiListing | null): ListingTag[] => {
  if (!listing) return []

  return [
    features.openHouse ? openHouseTag(listing) : null,
    features.aiQuality ? getQualityTag(listing) : null
  ].filter((tag) => tag !== null)
}
