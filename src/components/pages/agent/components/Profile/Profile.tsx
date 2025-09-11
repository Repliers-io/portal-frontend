import { Divider, Skeleton, Stack, Typography } from '@mui/material'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'

import {
  NotificationForm,
  ProfileBody,
  ProfileContainer,
  ProfileTop
} from './components'

const Profile = () => {
  const { client, loading } = useAgentEstimates()

  // TODO: need create template card with skeleton content for better UI/UX
  if (loading && !client) {
    return (
      <Skeleton
        variant="rounded"
        sx={{ width: '100%', height: 256, bgcolor: 'white', borderRadius: 3 }}
      />
    )
  }

  return (
    <ProfileContainer>
      {client ? (
        <>
          <ProfileTop />

          <Divider
            sx={{
              borderColor: 'divider',
              width: '100%',
              height: '1px',
              my: 2,
              mx: 0
            }}
          />

          <Stack direction="column" spacing={1.5} alignItems="center">
            <ProfileBody />
            <NotificationForm client={client} />
          </Stack>
        </>
      ) : (
        <Typography variant="h3">Unknown client</Typography>
      )}
    </ProfileContainer>
  )
}

export default Profile
