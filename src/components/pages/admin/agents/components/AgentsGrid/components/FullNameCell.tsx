import React from 'react'

import { Stack, TableCell, Typography } from '@mui/material'

import { ProfileAvatar } from 'components/atoms'

import type { FubUser } from 'services/API'

interface FullNameCellProps {
  fubUser: FubUser
}

const FullNameCell: React.FC<FullNameCellProps> = ({ fubUser }) => {
  const { repliers, name, picture } = fubUser
  const fullName = repliers ? `${repliers.fname} ${repliers.lname}` : name
  const avatar = repliers?.avatar || picture?.['162x162']

  return (
    <TableCell component="th" scope="fubUser">
      <Stack direction="row" alignItems="center" spacing={1}>
        <ProfileAvatar name={fullName} avatar={avatar} />
        <Typography variant="body1" whiteSpace="nowrap">
          {fullName}
        </Typography>
      </Stack>
    </TableCell>
  )
}

export default FullNameCell
