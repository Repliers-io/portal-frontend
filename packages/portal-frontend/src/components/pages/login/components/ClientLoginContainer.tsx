import React from 'react'

import { Box, Stack } from '@mui/material'

import content from '@configs/content'

const ClientLoginContainer = ({ children }: { children: React.ReactNode }) => {
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
        {children}
      </Box>
    </Stack>
  )
}
export default ClientLoginContainer
