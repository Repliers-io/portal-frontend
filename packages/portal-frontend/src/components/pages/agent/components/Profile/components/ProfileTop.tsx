import React from 'react'

import { Link, Stack, Typography } from '@mui/material'

import { PhoneLink } from 'components/atoms'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'

const ProfileTop = () => {
  const { client } = useAgentEstimates()

  if (!client) return null

  const { email, fname, lname, phone } = client

  return (
    <Stack direction="column" spacing={0.5} textAlign="center">
      <Typography variant="h3">{`${fname} ${lname}`}</Typography>
      {email && (
        <Typography variant="body1" color="text.secondary">
          <Link href={`mailto:${email}`} underline="hover">
            {email}
          </Link>
        </Typography>
      )}
      {phone && (
        <Typography variant="body1" color="text.secondary">
          <PhoneLink phone={phone} />
        </Typography>
      )}
    </Stack>
  )
}

export default ProfileTop
