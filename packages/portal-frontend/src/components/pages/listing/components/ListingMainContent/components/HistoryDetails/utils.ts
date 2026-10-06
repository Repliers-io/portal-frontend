import { type ApiListing, type HistoryItemType } from 'services/API'
import { getSeoUrl, rent, scrubbed } from 'utils/listings'

/**
 * PDP url for a history record. The extended history spans boards, so the record's own
 * board decides the route — a distinct-namespace board adds the `-{boardId}` suffix.
 * Records carry no address, so it comes from the listing being viewed.
 */
export const historyItemUrl = (listing: ApiListing, item: HistoryItemType) =>
  getSeoUrl({
    ...listing,
    mlsNumber: item.mlsNumber.toString(),
    boardId: item.boardId ?? listing.boardId
  })

// No link for the record shown on this page (active), a terminated one, or one
// whose lastStatus is redacted for guests — '!scrubbed!' could hide 'Ter'.
export const getHistoryItemLink = (
  listing: ApiListing,
  item: HistoryItemType,
  active: boolean
) =>
  !active && !scrubbed(item.lastStatus) ? historyItemUrl(listing, item) : ''

export const getListingData = (listing: ApiListing): HistoryItemType => ({
  lastStatus: listing.lastStatus,
  mlsNumber: listing.mlsNumber,
  listDate: listing.listDate,
  listPrice: listing.listPrice,
  timestamps: listing.timestamps,
  soldDate: listing.soldDate,
  soldPrice: +listing.soldPrice,
  office: listing.office,
  type: listing.type,
  images: listing.images ?? []
})

export const getActiveItem = (listing: ApiListing): HistoryItemType =>
  ({
    mlsNumber: listing.mlsNumber,
    timestamps: { listingEntryDate: listing.listDate },
    type: rent(listing) ? 'Rent' : 'Sale',
    listPrice: Number(listing.listPrice),
    images: listing.images || []
  }) as HistoryItemType
