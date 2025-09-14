'use client'

import { AppBar, Box, Container, Stack } from '@mui/material'

import content from '@configs/content'

import { useFeatures } from 'providers/FeaturesProvider'

import {
  Autosuggestion,
  AutosuggestionContainer,
  Logo,
  MobileMenu,
  ProfileMenuPill,
  ToolbarMenu
} from './components'

const Header = () => {
  const features = useFeatures()

  return (
    <Box sx={{ height: { xs: 64, sm: 72 } }}>
      <AppBar
        sx={{
          zIndex: 'modal', // +2 levels from its normal value; should be on top of the mobile menu drawer
          position: { xs: 'fixed', md: 'relative' }
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Stack
            spacing={2}
            width="100%"
            height={48}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Logo />

            {features.search && (
              <AutosuggestionContainer>
                <Autosuggestion />
              </AutosuggestionContainer>
            )}

            <ToolbarMenu sx={{ display: { xs: 'none', md: 'flex' } }} />

            <ProfileMenuPill sx={{ display: { xs: 'none', md: 'block' } }} />

            <Box
              sx={{
                width: 64,
                textAlign: 'right',
                minWidth: { sm: content.siteLogo.width },
                display: { xs: 'block', md: 'none' }
              }}
            >
              <MobileMenu />
            </Box>
          </Stack>
        </Container>
      </AppBar>
    </Box>
  )
}

export default Header
