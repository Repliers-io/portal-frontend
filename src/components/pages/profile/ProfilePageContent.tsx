'use client'

import { Box, Container, Typography } from '@mui/material'

import { ProfileForm } from '@shared/Dialogs/ProfileDialog'

const ProfilePageContent = () => {
  return (
    <Box>
      <Container>
        <Typography variant="h1" align="center" sx={{ pb: 2, pt: 8 }}>
          My Profile
        </Typography>
      </Container>
      <Container
        maxWidth="sm"
        sx={{
          pb: 8,
          '& .MuiDialogContent-root': { pt: 0, px: 0 },
          '& .MuiDialogActions-root': { pb: 0 }
        }}
      >
        <ProfileForm embedded />
      </Container>
    </Box>
  )
}

export default ProfilePageContent
