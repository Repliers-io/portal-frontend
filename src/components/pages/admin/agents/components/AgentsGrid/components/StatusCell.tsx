import React from 'react'

import { TableCell, Typography } from '@mui/material'
import { Stack } from '@mui/system'

import type { ApiAgentsCreateParams, FubUser } from 'services/API'
import { formatPhoneNumber } from 'utils/formatters'
import { sanitizeEmail, sanitizePhoneNumber } from 'utils/properties/sanitizers'

interface StatusCellProps {
  fubUser: FubUser
}

const getDiffFields = (prop: string, to: string): string => {
  const mappings: Partial<
    Record<keyof ApiAgentsCreateParams, { propName: string; content: string }>
  > = {
    fname: { propName: 'First Name', content: to },
    lname: { propName: 'Last Name', content: to },
    designation: { propName: 'Designation', content: to },
    avatar: { propName: 'Avatar', content: to },
    phone: { propName: 'Phone', content: sanitizePhoneNumber(to) },
    email: { propName: 'Email', content: sanitizeEmail(to) }
  }

  const { propName, content } = mappings[
    prop as keyof ApiAgentsCreateParams
  ] || {
    propName: prop,
    content: to
  }

  const resultMap: Record<string, () => string> = {
    phone: () => `New ${propName}: ${formatPhoneNumber(content)}`,
    default: () => `New ${propName}: ${content}`
  }

  return resultMap[prop]?.() || resultMap.default()
}

const StatusCell: React.FC<StatusCellProps> = ({ fubUser }) => {
  const { repliers, changes } = fubUser

  const getContent = () => {
    if (repliers && !changes?.length) {
      return <Typography variant="body1">Synchronised</Typography>
    }

    if (!repliers) {
      return <Typography variant="body1">Not in the Repliers</Typography>
    }

    if (changes?.length) {
      return (
        <Stack
          spacing={1}
          sx={{
            wordBreak: 'break-all',
            maxWidth: 200
          }}
        >
          {changes.map(({ to, prop }) => {
            return (
              <Typography variant="body2" key={prop}>
                {getDiffFields(prop, to)}
              </Typography>
            )
          })}
        </Stack>
      )
    }

    return null
  }

  const content = getContent()
  if (!content) return null

  return (
    <TableCell component="th" scope="fubUser">
      {content}
    </TableCell>
  )
}

export default StatusCell
