import React from 'react'

import { Link, Stack, TableCell, Typography } from '@mui/material'

import { PhoneLink } from 'components/atoms'

import type { FubUser } from 'services/API'

interface ContactInfoCellProps {
  fubUser: FubUser
}

const ContactInfoCell: React.FC<ContactInfoCellProps> = ({ fubUser }) => {
  const { repliers } = fubUser
  const email = repliers?.email || fubUser.email
  const phone = repliers?.phone || fubUser.phone

  return (
    <TableCell component="th" scope="fubUser">
      <Stack spacing={1}>
        {email && (
          <Typography variant="body2">
            <Link href={`mailto:${email}`} underline="hover">
              {email}
            </Link>
          </Typography>
        )}
        {phone && (
          <Typography variant="body2">
            <PhoneLink phone={phone} />
          </Typography>
        )}
      </Stack>
    </TableCell>
  )
}

export default ContactInfoCell
