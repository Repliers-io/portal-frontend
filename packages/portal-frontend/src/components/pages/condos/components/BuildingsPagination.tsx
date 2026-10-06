'use client'

import { Box, Pagination, PaginationItem } from '@mui/material'

import { LinkBehavior } from 'components/atoms/LinkBehavior'

type BuildingsPaginationProps = {
  currentPage: number
  numPages: number
  baseUrl: string
}

export const BuildingsPagination = ({
  currentPage,
  numPages,
  baseUrl
}: BuildingsPaginationProps) => {
  if (numPages <= 1) return null

  const buildPageUrl = (page: number) => {
    if (page <= 1) return baseUrl
    return `${baseUrl}?page=${page}`
  }

  return (
    <Box textAlign="center">
      <Pagination
        size="small"
        siblingCount={1}
        boundaryCount={1}
        page={currentPage}
        count={numPages}
        renderItem={(item) => {
          const { variant: _, ...rest } = item
          return (
            <PaginationItem
              component={LinkBehavior}
              href={buildPageUrl(item.page || 1)}
              {...rest}
            />
          )
        }}
        sx={{ display: 'inline-block' }}
      />
    </Box>
  )
}
