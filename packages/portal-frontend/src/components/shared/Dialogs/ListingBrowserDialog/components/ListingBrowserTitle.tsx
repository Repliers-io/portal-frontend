import { DialogTitle } from '@mui/material'

import listingsConfig from '@configs/listings'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatShortAddress, getSeoTitle } from 'utils/listings'
import { formatTitleAddress } from 'utils/listings/formatters'

export const ListingBrowserTitle = ({
  listing,
  id
}: {
  listing: ApiListing
  id?: string
}) => {
  const { address } = listing
  const title =
    listingsConfig.seoUnitFormat === 'labelled'
      ? formatTitleAddress(address, false)
      : formatShortAddress(address)

  return (
    <DialogTitle id={id} sx={{ userSelect: 'none' }}>
      <div title={getSeoTitle(listing)}>
        <ScrubbedText>{title}</ScrubbedText>
      </div>
    </DialogTitle>
  )
}
