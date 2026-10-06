'use client'

import React, { useEffect } from 'react'

import { Box, Pagination, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import searchConfig from '@configs/search'

import { type ApiListing } from 'services/API'
import { useSearch } from 'providers/SearchProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import { toServerPage } from 'utils/pagination'

import { useMarkerHighlight } from '../../useMarkerHighlight'

import { useGridListings } from './hooks/useGridListings'
import { useGridPagination } from './hooks/useGridPagination'
import {
  GridContentMobile,
  GridFooter,
  GridScrollContainer,
  GridStack,
  MultiUnitHeader
} from './components'

const { gridSpacing } = gridConfig

export const GridContent = ({
  gridListingsRef: serverListingsRef,
  onCardClick
}: {
  gridListingsRef?: React.MutableRefObject<ApiListing[]>
  onCardClick?: (e: React.MouseEvent, listing: ApiListing) => void
}) => {
  const { mobile, tablet } = useBreakpoints()
  const { loading, page, count, multiUnits } = useSearch()

  const {
    paramsPage,
    clientPage,
    serverPage,
    pagesCount,
    scrollRef,
    scrollToTop,
    currentServerPage,
    handlePageUpdate
  } = useGridPagination()

  const { serverListings, clientListings, gridReady, sliceToPage } =
    useGridListings({
      serverPage,
      clientPage,
      paramsPage,
      currentServerPage,
      scrollToTop
    })

  const { hoverMarker, leaveMarker } = useMarkerHighlight()

  useEffect(() => {
    if (serverListingsRef) serverListingsRef.current = serverListings
  }, [serverListings])

  const handlePageChange = (_e: any, newPage: number) => {
    const newServerPage = toServerPage(newPage)
    if (newServerPage === currentServerPage.current) {
      // update client properties instantly as the server page was not changed
      sliceToPage(newPage)
      scrollToTop()
    }
    handlePageUpdate(newPage)
  }

  const showMultiUnits = multiUnits.length > 0
  const propsOrUnits = showMultiUnits ? multiUnits : clientListings

  if (mobile || tablet) {
    return (
      <GridContentMobile
        page={page}
        count={count}
        loading={loading || !gridReady}
        clientPage={clientPage}
        pagesCount={pagesCount}
        listings={clientListings}
        onPageChange={handlePageChange}
        onCardClick={onCardClick}
      />
    )
  }

  return (
    <GridScrollContainer ref={scrollRef}>
      <Stack
        spacing={gridSpacing}
        direction={{ xs: 'row', md: 'column' }}
        sx={{ pb: 4, flex: 1 }}
      >
        {showMultiUnits && (
          <MultiUnitHeader unit={multiUnits[0]} count={multiUnits.length} />
        )}

        <GridStack
          page={page}
          loading={loading || !gridReady}
          listings={propsOrUnits}
          onCardClick={onCardClick}
          onCardEnter={hoverMarker}
          onCardLeave={leaveMarker}
        />

        {count > searchConfig.pageSize && !showMultiUnits && (
          <Box textAlign="center">
            <Pagination
              size="small"
              siblingCount={1}
              boundaryCount={1}
              page={clientPage}
              count={pagesCount}
              onChange={handlePageChange}
              sx={{ display: 'inline-block' }}
            />
          </Box>
        )}
      </Stack>
      <GridFooter />
    </GridScrollContainer>
  )
}
