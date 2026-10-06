'use client'

import React, { useEffect, useState } from 'react'

import { Box, Pagination, Skeleton, Stack, Typography } from '@mui/material'

import { type ListingCardSize } from '@configs/cards-grids'
import { GridStack } from '@pages/search/components/MapRoot/components/GridContent/components'

import { type ApiListing, type ApiQueryParams } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import { logError } from 'utils/log'

import { WidgetHtmlText } from '../../components'

export interface GridWidgetContentProps {
  title?: string
  pageSize?: number
  pagination?: boolean
  size?: ListingCardSize
  listings?: Partial<ApiQueryParams & Filters>
  onLoadingChange?: (loading: boolean) => void
  onResultsChange?: (count: number) => void
}

export const GridWidgetContent = ({
  title,
  pageSize,
  pagination,
  size = 'medium',
  listings: filters,
  onLoadingChange,
  onResultsChange
}: GridWidgetContentProps) => {
  const [listings, setListings] = useState<ApiListing[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Use pageSize from prop, or fallback to filters.resultsPerPage
  if (!pageSize && filters?.resultsPerPage) {
    // eslint-disable-next-line no-param-reassign
    pageSize = filters.resultsPerPage
  }

  const pagesCount = pageSize ? Math.ceil(totalCount / pageSize) : 0

  const fetchListings = async (page: number = 1) => {
    try {
      setLoading(true)
      onLoadingChange?.(true)
      const queryFilters = {
        ...filters,
        ...(pagination && pageSize
          ? { pageNum: page, resultsPerPage: pageSize }
          : {})
      }
      const response = await SearchService.fetchListings(
        queryFilters,
        true // independent: don't participate in AbortController signal
      )
      if (response) {
        setListings(response.listings)
        setTotalCount(response.count)
        onResultsChange?.(response.count)
      }
    } catch (error) {
      logError('GridWidget::Error fetching data', error)
      onResultsChange?.(0)
    } finally {
      setLoading(false)
      setInitialLoad(false)
      onLoadingChange?.(false)
    }
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage)
    fetchListings(newPage)
  }

  useEffect(() => {
    fetchListings(currentPage)
  }, [])

  return (
    <Stack spacing={4}>
      {title && (
        <Typography variant="h3" sx={{ px: { xs: 2, sm: 0 } }}>
          <WidgetHtmlText>{title}</WidgetHtmlText>
        </Typography>
      )}
      <GridStack
        listings={listings}
        loading={loading}
        pageSize={pageSize}
        size={size}
      />
      {pagination && (loading || pagesCount > 1) && (
        <Box
          sx={{
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading && initialLoad ? (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: '2px' }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  width={26}
                  height={26}
                  variant="circular"
                  sx={{ bgcolor: 'background.default' }}
                />
              ))}
            </Stack>
          ) : pagesCount > 1 ? (
            <Pagination
              size="small"
              siblingCount={1}
              boundaryCount={1}
              page={currentPage}
              count={pagesCount}
              onChange={handlePageChange}
              // Buttons are 26px but inherit a 28px line-height whose baseline
              // strut inflates each <li> to 29px, spilling 1px past this fixed
              // row and tripping a scrollbar that collapses the grid. Collapse
              // the line box so the row keeps its true 26px height.
              sx={{ lineHeight: 1 }}
            />
          ) : null}
        </Box>
      )}
    </Stack>
  )
}
