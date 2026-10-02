import { DialogTitle } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatShortAddress, getSeoTitle } from 'utils/listings'

export const ListingBrowserTitle = ({
  listing,
  id
}: {
  listing: ApiListing
  id?: string
}) => {
  return (
    <DialogTitle id={id} sx={{ userSelect: 'none' }}>
      <div title={getSeoTitle(listing)}>
        <ScrubbedText>{formatShortAddress(listing.address)}</ScrubbedText>
      </div>
    </DialogTitle>
  )
}
