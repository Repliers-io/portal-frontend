'use client'

import React from 'react'

import { Box, CircularProgress } from '@mui/material'

import { ListingsCounter, SortModesSelect } from '@shared/Filters'

import { useSearch } from 'providers/SearchProvider'

import { FiltersTransitionContainer } from '.'

const GridFilters = () => {
  const { loading, page, count, filters, setFilter } = useSearch()

  const handleSortChange = (newValue: string) => setFilter('sortBy', newValue)

  return (
    <FiltersTransitionContainer>
      <Box sx={{ height: 34, display: 'flex', alignItems: 'center' }}>
        {loading || !page ? (
          <CircularProgress size={16} sx={{ mx: 1 }} />
        ) : (
          <ListingsCounter filters={filters} count={count} />
        )}
      </Box>
      <SortModesSelect filters={filters} onChange={handleSortChange} />
    </FiltersTransitionContainer>
  )
}

export default GridFilters
