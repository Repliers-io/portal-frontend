'use client'

import React, { useState } from 'react'

import { Pagination, Paper, Stack, Table, TableContainer } from '@mui/material'

import { useAgents } from 'providers/AgentsProvider'
import { toSafeNumber } from 'utils/formatters'

import { BodyContent, HeaderRow, SearchBar } from './components'

const AgentsGrid = () => {
  const { data, fetch, loading } = useAgents()
  const pages = toSafeNumber(
    data?.total && data?.limit ? Math.ceil(data.total / data.limit) : 1
  )
  const [page, setPage] = useState(1)

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
    const offset = (newPage - 1) * (data?.limit || 10)
    fetch({ offset, limit: data?.limit || 10 })
  }

  return (
    <Stack direction="column" gap={3}>
      <SearchBar />
      <Paper sx={{ border: 0 }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            {!loading && <HeaderRow />}
            <BodyContent />
          </Table>
        </TableContainer>
      </Paper>
      {pages > 1 && (
        <Pagination
          disabled={loading}
          shape="rounded"
          count={pages}
          color="secondary"
          page={page}
          siblingCount={2}
          boundaryCount={1}
          onChange={handleChangePage}
        />
      )}
    </Stack>
  )
}

export default AgentsGrid
