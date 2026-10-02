'use client'

import React from 'react'

import { Pagination, Paper, Stack, Table, TableContainer } from '@mui/material'

import { useAgentClients } from 'providers/AgentClientsProvider'

import { BodyContent, HeaderRow, SearchBar } from './components'

const AgentClientsGrid = () => {
  const { data, fetchClients } = useAgentClients()
  const { page, numPages } = data

  const handleChangePage = (_event: unknown, newPage: number) => {
    fetchClients({ pageNum: newPage })
  }

  return (
    <Stack direction="column" gap={3}>
      <SearchBar />
      <Paper sx={{ border: 0 }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <HeaderRow />
            <BodyContent />
          </Table>
        </TableContainer>
      </Paper>
      {numPages > 1 && (
        <Pagination
          shape="rounded"
          count={numPages || 1}
          color="secondary"
          page={page}
          siblingCount={0}
          boundaryCount={1}
          onChange={handleChangePage}
        />
      )}
    </Stack>
  )
}

export default AgentClientsGrid
