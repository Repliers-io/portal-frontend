'use client'

import React, { useState } from 'react'

import { Container, Stack } from '@mui/material'

import { gridSpacing } from '@configs/cards-grids'
// TODO: fix constants import from @pages alias
import { gridColumnsMediaQueries } from '@pages/search/components/MapRoot/constants'
import { PropertyDialog } from '@shared/Dialogs'
import { EmptyFavorites } from '@shared/EmptyStates'
import { PropertyCard } from '@shared/Property'

import { LoadingContent } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useFavorites } from 'providers/FavoritesProvider'
import useBreakpoints from 'hooks/useBreakpoints'

const FavoritesPageContent = () => {
  const { wideScreen } = useBreakpoints()
  const { list, loading } = useFavorites()
  const { showDialog: showPropertyDialog } = useDialog('property')
  const [propertyDialogIndex, setPropertyDialogIndex] = useState(-1)

  const sortedList = list.sort((a, b) =>
    (a.favoriteId || 0) > (b.favoriteId || 0) ? -1 : 1
  )

  const handleCardClick = (
    e: React.MouseEvent<Element, MouseEvent>,
    index: number
  ) => {
    if (!wideScreen) return

    setPropertyDialogIndex(index)
    showPropertyDialog()

    e.preventDefault()
    e.stopPropagation()
  }

  if (loading) return <LoadingContent />

  return (
    <Container
      disableGutters
      sx={{
        ...gridColumnsMediaQueries,
        px: gridSpacing
      }}
    >
      {sortedList.length ? (
        <Stack
          useFlexGap
          spacing={gridSpacing}
          direction="row"
          flexWrap="wrap"
          justifyContent={sortedList.length > 6 ? 'flex-start' : 'center'}
        >
          {sortedList.map((property, index) => (
            <PropertyCard
              key={index}
              property={property}
              onClick={(e) => handleCardClick(e, index)}
            />
          ))}
        </Stack>
      ) : (
        <EmptyFavorites />
      )}

      <PropertyDialog active={propertyDialogIndex} properties={sortedList} />
    </Container>
  )
}

export default FavoritesPageContent
