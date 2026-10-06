import React from 'react'

import { CircularProgress, TableBody, TableCell, TableRow } from '@mui/material'

import { useAgents } from 'providers/AgentsProvider'

import {
  ActionCell,
  ContactInfoCell,
  FullNameCell,
  LastSyncCell,
  RoleCell,
  StatusCell
} from '.'

const BodyContent = () => {
  const { data, loading } = useAgents()

  if (loading || !data || data?.agents?.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} height={400} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const { agents } = data

  return (
    <TableBody>
      {agents.map((fubUser) => {
        return (
          <TableRow
            key={fubUser.id}
            sx={{
              height: 73,
              '&:last-child td, &:last-child th': {
                borderColor: 'transparent'
              },
              '& .MuiTableCell-body': {
                borderColor: 'divider'
              }
            }}
          >
            <FullNameCell fubUser={fubUser} />
            <ContactInfoCell fubUser={fubUser} />
            <RoleCell fubUser={fubUser} />
            <LastSyncCell fubUser={fubUser} />
            <StatusCell fubUser={fubUser} />
            <ActionCell fubUser={fubUser} />
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export default BodyContent
