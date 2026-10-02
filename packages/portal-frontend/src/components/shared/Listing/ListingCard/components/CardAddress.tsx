import { Typography } from '@mui/material'

import { type ListingCardSize } from '@defaults/cards-grids'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatFullAddress, listingCity } from 'utils/listings'
import { toRem } from 'utils/theme'

export const CardAddress = ({
  listing,
  size
}: {
  listing: ApiListing
  size: ListingCardSize
}) => {
  const { address } = listing

  const sizeMap = size === 'small'
  const sizeDrawer = size === 'drawer'
  const width = sizeDrawer ? '70%' : 'auto'
  const color = sizeDrawer ? '#FFFFFF' : 'text.medium'
  const fontSize = toRem(sizeMap ? 11 : sizeDrawer ? 18 : 14)
  const lineHeight = toRem(sizeMap ? 18 : sizeDrawer ? 28 : 20)

  return (
    <Typography
      width={width}
      color={color}
      fontSize={fontSize}
      lineHeight={lineHeight}
      noWrap={!sizeDrawer}
    >
      <ScrubbedText>
        {formatFullAddress({ ...address, city: listingCity(address) })}
      </ScrubbedText>
    </Typography>
  )
}
