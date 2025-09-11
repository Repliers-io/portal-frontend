'use client'

import React from 'react'

import { Container, Stack } from '@mui/material'

import { gridSpacing, savedSearchCard } from '@configs/cards-grids'
import { SaveSearchDialog } from '@shared/Dialogs'
import { EmptySavedSearch } from '@shared/EmptyStates'

import { LoadingContent } from 'components/atoms'

import { useSaveSearch } from 'providers/SaveSearchProvider'

import { SavedSearchCard } from './components'

const gridColumnsWidth = Array.from({ length: 3 }, (_, index) => {
  const columns = index + 1
  const spacers = columns
  return Number(savedSearchCard.width) * columns + gridSpacing * spacers * 8
})

const gridColumnsMediaQueries = Object.assign(
  {},
  ...gridColumnsWidth.map((width) => {
    const maxWidth = width - gridSpacing * 8
    return {
      [`@media (min-width: ${maxWidth + 48}px)`]: { maxWidth }
    }
  })
)

const SavedSearchesPageContent = () => {
  const { list, loading } = useSaveSearch()

  if (loading) return <LoadingContent />

  return (
    <Container disableGutters sx={{ ...gridColumnsMediaQueries }}>
      {list.length ? (
        <Stack
          useFlexGap
          direction="row"
          flexWrap="wrap"
          spacing={{ xs: 2, sm: gridSpacing }}
          justifyContent={list.length > 2 ? 'flex-start' : 'center'}
        >
          {list.map((search) => (
            <SavedSearchCard key={search.searchId} search={search} />
          ))}
        </Stack>
      ) : (
        <EmptySavedSearch />
      )}

      <SaveSearchDialog />
    </Container>
  )
}

export default SavedSearchesPageContent
