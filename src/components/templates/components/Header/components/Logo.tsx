'use client'

import React from 'react'
import Image from 'next/image'

import { Box, Button } from '@mui/material'

import content from '@configs/content'
import routes from '@configs/routes'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

const { siteName, siteLogo: logo, siteMobileLogo: xsLogo } = content

const Logo = () => {
  const clientSide = useClientSide()
  const { agentRole, adminRole } = useUser()
  const logoRoute = !clientSide
    ? '' // we don't want to show any logo link on server side
    : adminRole
      ? routes.adminAgents
      : agentRole
        ? routes.agent
        : routes.home

  return (
    <Box sx={{ minWidth: { xs: 64, sm: 0 } }}>
      <Button
        {...(logoRoute && { href: logoRoute })}
        sx={{
          p: 0,
          px: 0.5,
          minWidth: 0,
          alignContent: 'center'
        }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Image
            priority
            unoptimized
            alt={siteName}
            src={logo.url}
            width={logo.width}
            height={logo.height}
            style={{ display: 'block' }}
          />
        </Box>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Image
            unoptimized
            alt={siteName}
            src={xsLogo.url}
            width={xsLogo.width}
            height={xsLogo.height}
            style={{ display: 'block' }}
          />
        </Box>
      </Button>
    </Box>
  )
}

export default Logo
