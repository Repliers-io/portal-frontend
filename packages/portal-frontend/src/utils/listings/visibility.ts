import { type ApiListing } from 'services/API'

export const displayPublic = (listing: ApiListing) =>
  listing.permissions?.displayPublic === 'Y'

export const restricted = (listing: ApiListing) => !displayPublic(listing)

export const restrictedToGuest = (listing: ApiListing, logged?: boolean) =>
  !logged && restricted(listing)
