'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { Pagination, Skeleton, Stack } from '@mui/material'

import searchConfig from '@configs/search'

import useClientSide from 'hooks/useClientSide'

// NOTE: WE HAVE TO render <Pagination /> only on client side as it comes
// screwed up from the server (+ broken states)

const CatalogPagination = ({
  page,
  count
}: {
  page: number
  count: number
}) => {
  const router = useRouter()
  const clientSide = useClientSide()
  const pages = Math.ceil(count / searchConfig.pageSize)

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    router.push(`${window?.location.pathname}?page=${value}`)
  }

  return count > searchConfig.pageSize ? (
    clientSide ? (
      <Pagination
        size="small"
        page={page}
        count={pages}
        siblingCount={1}
        boundaryCount={1}
        onChange={handlePageChange}
      />
    ) : (
      <Stack spacing={2} direction="row" py={0.5}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="circular" sx={{ width: 20, height: 20 }} />
        ))}
      </Stack>
    )
  ) : null
}

export default CatalogPagination
