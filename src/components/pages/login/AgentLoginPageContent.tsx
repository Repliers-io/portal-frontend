'use client'

import React, { useEffect } from 'react'

import { Box, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import { GoogleAuthButton } from '@shared/Buttons'

import { storeRedirectUrl } from './utils'

const LoginPageContent = () => {
  useEffect(() => {
    storeRedirectUrl(true)
  }, [])

  return (
    <Stack direction="row" minHeight="100svh">
      <Box
        width="50%"
        display={{
          xs: 'none',
          md: 'block'
        }}
        sx={{
          backgroundColor: 'background.default',
          backgroundImage: `url(${content.loginSplashscreen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <Box
        width={{
          xs: '100%',
          md: '50%'
        }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          spacing={4}
          alignItems="center"
          maxWidth={{
            xs: 340,
            sm: 400
          }}
        >
          <Typography component="h2" variant="h2">
            Agents Portal
          </Typography>
          <GoogleAuthButton text="Sign in with Google" />
        </Stack>
      </Box>
    </Stack>
  )
}

export default LoginPageContent
