'use client'

import React from 'react'

import { Box, CircularProgress } from '@mui/material'

import { ListingsCounter, SortModesSelect } from '@shared/Filters'

import { useSearch } from 'providers/SearchProvider'

import { GridFiltersContainer } from '.'

export const GridFilters = () => {
  const { loading, page, count, filters, setFilter } = useSearch()

  const handleSortChange = (newValue: string) => setFilter('sortBy', newValue)

  return (
    <GridFiltersContainer>
      <Box
        sx={{
          height: 34,
          minWidth: 100,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {loading || !page ? (
          <CircularProgress size={16} sx={{ mr: 1 }} />
        ) : (
          <ListingsCounter filters={filters} count={count} />
        )}
      </Box>
      <SortModesSelect filters={filters} onChange={handleSortChange} />
    </GridFiltersContainer>
  )
}
