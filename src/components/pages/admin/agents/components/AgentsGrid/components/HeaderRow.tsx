import React from 'react'

import { TableCell, TableHead, TableRow, Typography } from '@mui/material'

export type Order = 'asc' | 'desc'

export interface Data {
  name: string
  email: string
  role: string
  lastSyncOn: string
  status: string
  action: string
}

export type DataColumn = keyof Data

interface HeadCell {
  value: DataColumn
  label: string
}

const headCells: readonly HeadCell[] = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email & Phone' },
  { value: 'role', label: 'Designation' },
  { value: 'lastSyncOn', label: 'Last Synchronised' },
  { value: 'status', label: 'Status' },
  { value: 'action', label: 'Action' }
]

const HeaderRow = () => {
  return (
    <TableHead>
      <TableRow
        sx={{
          height: 40,
          background: '#DADBE2'
        }}
      >
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.value}
            sx={{
              py: 1
            }}
          >
            <Typography variant="h4">{headCell.label}</Typography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export default HeaderRow
