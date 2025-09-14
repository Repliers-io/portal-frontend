import React from 'react'

import { TableCell, Typography } from '@mui/material'

import type { FubUser } from 'services/API'

interface RoleCellProps {
  fubUser: FubUser
}

const RoleCell: React.FC<RoleCellProps> = ({ fubUser }) => {
  const { repliers } = fubUser
  const role = repliers?.designation || fubUser.role

  return (
    <TableCell component="th" scope="fubUser">
      <Typography variant="body1">{role}</Typography>
    </TableCell>
  )
}

export default RoleCell
