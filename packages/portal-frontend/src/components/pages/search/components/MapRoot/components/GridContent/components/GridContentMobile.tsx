import React from 'react'

import { Box, Pagination, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import searchConfig from '@configs/search'

import { type ApiListing } from 'services/API'

import { GridFooter } from './GridFooter'
import { GridStack } from './GridStack'

export type GridContentMobileProps = {
  page: number
  loading: boolean
  count: number
  pagesCount: number
  clientPage: number
  listings: ApiListing[]
  onCardClick?: (e: React.MouseEvent, listing: ApiListing) => void
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
}

const { gridSpacing } = gridConfig

// Static: GridMobileDrawer scrolls it together with the grid header
export const GridContentMobile = ({
  page,
  loading,
  count,
  pagesCount,
  clientPage,
  listings,
  onCardClick,
  onPageChange
}: GridContentMobileProps) => (
  <Stack spacing={gridSpacing} direction="column" sx={{ pt: 4 }}>
    <GridStack
      page={page}
      loading={loading}
      listings={listings}
      onCardClick={onCardClick}
    />
    {count > searchConfig.pageSize && (
      <Box textAlign="center">
        <Pagination
          size="small"
          siblingCount={1}
          boundaryCount={1}
          page={clientPage}
          count={pagesCount}
          onChange={onPageChange}
          sx={{ display: 'inline-block' }}
        />
      </Box>
    )}
    <GridFooter />
  </Stack>
)
