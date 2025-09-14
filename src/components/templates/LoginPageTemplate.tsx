import React from 'react'

import { Box, Stack } from '@mui/material'

import content from '@configs/content'

interface LoginPageTemplateProps {
  children: React.ReactNode
}

const LoginPageTemplate: React.FC<LoginPageTemplateProps> = ({ children }) => {
  return (
    <Stack direction="row" minHeight="100svh">
      <Box
        width="50%"
        display={{
          xs: 'none',
          md: 'block'
        }}
        sx={{
          backgroundImage: `url(${content.loginSplashscreen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></Box>
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
        {children}
      </Box>
    </Stack>
  )
}

export default LoginPageTemplate
