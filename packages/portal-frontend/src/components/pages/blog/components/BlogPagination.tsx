'use client'

import React from 'react'

import { Box, Pagination, PaginationItem } from '@mui/material'

import { LinkBehavior } from 'components/atoms/LinkBehavior'

type BlogPaginationProps = {
  currentPage: number // 0-based
  totalPages: number
  baseUrl: string // e.g., '/blog', '/blog/tag/react', '/blog/category/tech'
}

export const BlogPagination = ({
  currentPage,
  totalPages,
  baseUrl
}: BlogPaginationProps) => {
  if (totalPages <= 1) return null

  const buildPageUrl = (page: number) => {
    if (page === 0) return baseUrl
    return `${baseUrl}/page/${page + 1}` // Convert 0-based to 1-based for URL
  }

  return (
    <Box textAlign="center">
      <Pagination
        size="small"
        siblingCount={1}
        boundaryCount={1}
        page={currentPage + 1} // Convert 0-based to 1-based for display
        count={totalPages}
        renderItem={(item) => {
          const { variant: _, ...restItem } = item
          return (
            <PaginationItem
              component={LinkBehavior}
              href={buildPageUrl((item.page || 1) - 1)} // Convert 1-based to 0-based
              {...restItem}
            />
          )
        }}
        sx={{ display: 'inline-block' }}
      />
    </Box>
  )
}
