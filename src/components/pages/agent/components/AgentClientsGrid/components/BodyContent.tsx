import React from 'react'

import {
  CircularProgress,
  Link,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material'

import routes from '@configs/routes'

import { DateLabel, PhoneLink } from 'components/atoms'

import { useAgentClients } from 'providers/AgentClientsProvider'

import ClientEstimate from './ClientEstimate'

const BodyContent = () => {
  const {
    data: { clients },
    loading
  } = useAgentClients()

  if (loading && !clients.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} height={400} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {clients.map((row) => (
        <TableRow
          key={row.clientId}
          sx={{
            height: 73, // 72px + 1px border-bottom
            '&:last-child td, &:last-child th': {
              borderColor: 'transparent'
            },
            '& .MuiTableCell-body': {
              borderColor: 'divider'
            }
          }}
        >
          <TableCell component="th" scope="row">
            <Typography variant="body1">
              <Link
                color="secondary.main"
                href={`${routes.agentClient}/${row.clientId}`}
                sx={{
                  transition: 'opacity 0.3s',
                  // TODO: hover effect must be discussed for correct implementation, it's temporary solution
                  '&:hover': {
                    opacity: 0.6
                  }
                }}
              >
                {String(row.fname)} {String(row.lname)}
              </Link>
            </Typography>
          </TableCell>
          <TableCell>
            <ClientEstimate client={row} />
          </TableCell>
          <TableCell>
            {row.email && (
              <Typography variant="body2">
                <Link href={`mailto:${row.email}`} underline="hover">
                  {row.email}
                </Link>
              </Typography>
            )}
            {row.phone && (
              <Typography variant="body2" mt={1}>
                <PhoneLink phone={row.phone} />
              </Typography>
            )}
          </TableCell>
          <TableCell>
            <Typography variant="body1">
              <DateLabel value={row.createdOn} />
            </Typography>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

export default BodyContent
