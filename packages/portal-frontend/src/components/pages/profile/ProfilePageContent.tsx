'use client'

import { useTranslations } from 'next-intl'

import { Box, Container, Typography } from '@mui/material'

import { ProfileForm } from '@shared/Dialogs/ProfileDialog'

const ProfilePageContent = () => {
  const t = useTranslations('Profile')

  return (
    <Box>
      <Container>
        <Typography variant="h1" align="center" sx={{ pb: 2, pt: 8 }}>
          {t('title')}
        </Typography>
      </Container>
      <Container
        maxWidth="sm"
        sx={{
          pb: 8,
          '& .MuiDialogActions-root': { pb: 0 },
          '& .MuiDialogContent-root': { pt: 0, px: 0 }
        }}
      >
        <ProfileForm embedded />
      </Container>
    </Box>
  )
}

export default ProfilePageContent
