'use client'

import React, { useState } from 'react'

import { GridCenteringContainer } from '@shared/Containers'
import { ListingBrowserDialog } from '@shared/Dialogs'
import { EmptyFavorites } from '@shared/EmptyStates'
import { CardSurface, ListingCard } from '@shared/Listing'

import { LoadingContent } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useFavorites } from 'providers/FavoritesProvider'
import useBreakpoints from 'hooks/useBreakpoints'

const FavoritesPageContent = () => {
  const { wideScreen } = useBreakpoints()
  const { list, loading } = useFavorites()
  const { showDialog: showListingBrowser } = useDialog('listing')
  const [listingBrowserIndex, setListingBrowserIndex] = useState(-1)

  const sortedList = list.sort((a, b) =>
    (a.favoriteId || 0) > (b.favoriteId || 0) ? -1 : 1
  )

  const handleCardClick = (
    e: React.MouseEvent<Element, MouseEvent>,
    index: number
  ) => {
    if (!wideScreen) return

    setListingBrowserIndex(index)
    showListingBrowser()

    e.preventDefault()
    e.stopPropagation()
  }

  if (loading) return <LoadingContent />

  return (
    <GridCenteringContainer>
      {sortedList.length ? (
        <CardSurface
          surface="favorites"
          variant="grid"
          justifyContent={{
            xs: 'center',
            md: sortedList.length > 6 ? 'flex-start' : 'center'
          }}
        >
          {sortedList.map((listing, index) => (
            <ListingCard
              key={index}
              listing={listing}
              onClick={(e) => handleCardClick(e, index)}
            />
          ))}
        </CardSurface>
      ) : (
        <EmptyFavorites />
      )}

      <ListingBrowserDialog
        active={listingBrowserIndex}
        listings={sortedList}
      />
    </GridCenteringContainer>
  )
}

export default FavoritesPageContent
