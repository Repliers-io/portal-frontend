import { type ListingCardSize } from '@defaults/cards-grids'

import { type ApiListing } from 'services/API'

import {
  CardAddress,
  CardContentContainer,
  CardFooter,
  CardIconCounts,
  CardPrice
} from '.'

type ContentProps = {
  listing: ApiListing
  size: ListingCardSize
}

export const CardContent = ({ listing, size }: ContentProps) => {
  return (
    <CardContentContainer size={size}>
      <CardPrice listing={listing} size={size} />
      <CardAddress listing={listing} size={size} />
      <CardIconCounts listing={listing} size={size} />
      <CardFooter listing={listing} size={size} />
    </CardContentContainer>
  )
}
