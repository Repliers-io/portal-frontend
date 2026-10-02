'use client'

import { AppBar, Box, Container, Stack } from '@mui/material'

import content from '@configs/content'
import layoutConfig from '@configs/layout'
import menuConfig from '@configs/menu'
import searchConfig from '@configs/search'

import { type CmsMenuItem } from 'services/CMS'

import { useHeaderMenuItems } from './hooks/useHeaderMenuItems'
import {
  Autosuggestion,
  AutosuggestionContainer,
  Logo,
  MegaMenu,
  MobileMenu,
  ProfileMenuPill,
  ToolbarMenu
} from './components'

interface HeaderContentProps {
  cmsItems: CmsMenuItem[]
}

export const HeaderContent = ({ cmsItems }: HeaderContentProps) => {
  const { toolbarItems, megamenuItems } = useHeaderMenuItems(cmsItems)
  const megaMenu = menuConfig.dropdown.variant === 'megamenu'

  return (
    <Box sx={{ height: layoutConfig.headerHeight, position: 'relative' }}>
      <AppBar
        sx={{
          zIndex: 'modal',
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

            {searchConfig.autosuggestPosition !== 'disabled' && (
              <AutosuggestionContainer>
                <Autosuggestion />
              </AutosuggestionContainer>
            )}

            <ToolbarMenu
              items={toolbarItems}
              cmsItems={cmsItems}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />

            <ProfileMenuPill sx={{ display: { xs: 'none', md: 'block' } }} />

            <Box
              sx={{
                textAlign: 'right',
                minWidth: { sm: content.siteLogo.width },
                display: { xs: 'block', md: 'none' }
              }}
            >
              <MobileMenu items={toolbarItems} cmsItems={cmsItems} />
            </Box>
          </Stack>
        </Container>
      </AppBar>
      {megaMenu && <MegaMenu items={megamenuItems} />}
    </Box>
  )
}
