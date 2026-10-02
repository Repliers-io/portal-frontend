'use client'

import React, { useState } from 'react'

import { Box, Button } from '@mui/material'

import { ClearAllIcon } from '@configs/icons'
import { GridCenteringContainer } from '@shared/Containers'
import { ListingBrowserDialog } from '@shared/Dialogs'
import { EmptyRecents } from '@shared/EmptyStates'
import { CardSurface, ListingCard } from '@shared/Listing'

import { useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useRecents from 'hooks/useRecents'

export const RecentlyViewedPageContent = () => {
  const { wideScreen } = useBreakpoints()
  const { recents, clearRecents } = useRecents()
  const { showDialog: showListingBrowser } = useDialog('listing')
  const [listingBrowserIndex, setListingBrowserIndex] = useState(-1)

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

  return (
    <GridCenteringContainer>
      {!recents.length ? (
        <EmptyRecents />
      ) : (
        <CardSurface
          surface="recent"
          variant="grid"
          justifyContent={{
            xs: 'center',
            md: recents.length > 6 ? 'flex-start' : 'center'
          }}
        >
          {recents.map((listing, index) => (
            <ListingCard
              listing={listing}
              key={`${listing.mlsNumber}-${listing.boardId}`}
              onClick={(e) => handleCardClick(e, index)}
            />
          ))}
        </CardSurface>
      )}
      {recents.length > 0 && (
        <Box
          sx={{
            pt: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ClearAllIcon />}
            onClick={clearRecents}
          >
            Clear All
          </Button>
        </Box>
      )}

      <ListingBrowserDialog active={listingBrowserIndex} listings={recents} />
    </GridCenteringContainer>
  )
}
