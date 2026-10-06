import React from 'react'

import { TableCell, Typography } from '@mui/material'

import type { FubUser } from 'services/API'
import { formatDate } from 'utils/formatters'

export const extractDateAndTime = (isoString: string): [string, string] => {
  const date = formatDate(isoString) || ''
  const time = formatDate(isoString, { template: 'HH:mm:ss' }) || ''

  return [date, time]
}

interface LastSyncCellProps {
  fubUser: FubUser
}

const LastSyncCell: React.FC<LastSyncCellProps> = ({ fubUser }) => {
  const { repliers } = fubUser
  const lastSyncOn = repliers?.data?.lastSyncOn || repliers?.data?.syncDate

  if (!lastSyncOn) {
    return (
      <TableCell component="th" scope="fubUser">
        <Typography variant="body1">N/a</Typography>
      </TableCell>
    )
  }

  const [date, time] = extractDateAndTime(lastSyncOn as string)

  return (
    <TableCell component="th" scope="fubUser">
      <Typography variant="body1">{date}</Typography>
      <Typography variant="body1">{time}</Typography>
    </TableCell>
  )
}

export default LastSyncCell
