import React from 'react'

import features from '@configs/features'
import listingsConfig from '@configs/listings'
import { FavoritesButton, ListingShareButton } from '@pages/listing/components'

import { FallInTransition } from 'components/atoms'

import useClientSide from 'hooks/useClientSide'

export const RightSideButtons = ({ sticky }: { sticky: boolean }) => {
  const clientSide = useClientSide()

  if (!clientSide) return null

  return (
    <>
      {listingsConfig.components.share && (
        <FallInTransition show={sticky}>
          <ListingShareButton variant="icon" />
        </FallInTransition>
      )}

      {features.favorites && (
        <FallInTransition show={sticky}>
          <FavoritesButton variant="icon" />
        </FallInTransition>
      )}
    </>
  )
}
