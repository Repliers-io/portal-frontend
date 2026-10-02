'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { Box, Pagination, Skeleton, Stack } from '@mui/material'

import searchConfig from '@configs/search'

import useClientSide from 'hooks/useClientSide'

// NOTE: WE HAVE TO render <Pagination /> only on client side as it comes
// screwed up from the server (+ broken states)

export const LocationPagination = ({
  page,
  count,
  loading
}: {
  page: number
  count: number
  loading?: boolean
}) => {
  const router = useRouter()
  const clientSide = useClientSide()
  const pages = Math.ceil(count / searchConfig.pageSize)

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    router.push(`${window?.location.pathname}?page=${value}`)
  }

  return (
    <Box textAlign="center" sx={{ height: 28 }}>
      {!clientSide || loading ? (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: '2px' }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={26} height={26} variant="circular" />
          ))}
        </Stack>
      ) : pages > 1 ? (
        <Pagination
          size="small"
          page={page}
          count={pages}
          siblingCount={1}
          boundaryCount={1}
          onChange={handlePageChange}
          sx={{ display: 'inline-block' }}
        />
      ) : null}
    </Box>
  )
}
