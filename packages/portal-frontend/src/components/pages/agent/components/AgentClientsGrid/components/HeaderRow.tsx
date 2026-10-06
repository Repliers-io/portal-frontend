import React from 'react'

import { TableCell, TableHead, TableRow, Typography } from '@mui/material'

export type Order = 'asc' | 'desc'

export interface Data {
  estimate: string
  name: string
  email: string
  createdOn: string
}

export type DataColumn = keyof Data

interface HeadCell {
  value: DataColumn
  label: string
}

const headCells: readonly HeadCell[] = [
  { value: 'name', label: 'Name' },
  { value: 'estimate', label: 'Estimate address and price' },
  { value: 'email', label: 'Email & Phone' },
  { value: 'createdOn', label: 'Date Created' }
]

const HeaderRow = () => {
  return (
    <TableHead>
      <TableRow
        sx={{
          height: 40,
          background: '#EFEFEF'
        }}
      >
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.value}
            width="25%"
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
