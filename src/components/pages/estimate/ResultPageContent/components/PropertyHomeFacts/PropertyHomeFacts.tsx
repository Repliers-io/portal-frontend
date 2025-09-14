'use client'

import Grid from '@mui/material/Grid2'

import { useUser } from 'providers/UserProvider'

import HomeFacts from './components/HomeFacts'
import ScheduleMeeting from './components/ScheduleMeeting'

const PropertyHomeFacts = () => {
  const { agentRole } = useUser()

  // for agent flow always render standalone HomeFacts
  if (agentRole) {
    return <HomeFacts />
  }

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          md: 8
        }}
      >
        <HomeFacts />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 4
        }}
      >
        <ScheduleMeeting />
      </Grid>
    </Grid>
  )
}

export default PropertyHomeFacts
