'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Menu, Stack, type SxProps } from '@mui/material'

import { MenuIcon } from '@configs/icons'

import { useDialogContext } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'

import { ProfileAvatar } from '../../..'

import { useProfileMenuMapper } from './hooks/useProfileMenuMapper'
import { ProfileMenuButton } from './ProfileMenuButton'
import { ProfileMenuItem } from './ProfileMenuItem'

export const ProfileMenuPill = ({ sx }: { sx?: SxProps }) => {
  const { showDialog } = useDialogContext()
  const { logged, logout } = useUser()
  const t = useTranslations()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClose = () => setAnchorEl(null)
  const handleLoginClick = () => showDialog('auth')
  const handleLogoutClick = () => {
    handleClose()
    logout()
  }

  const items = useProfileMenuMapper(handleLogoutClick)

  const handleMenuOpenClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Box sx={sx}>
      {/* Mobile: plain Sign in / Sign out, profile items are inline above */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ProfileMenuButton
          onClick={logged ? handleLogoutClick : handleLoginClick}
        >
          {logged ? t('Menu.signOut') : t('Forms.signInTitle')}
        </ProfileMenuButton>
      </Box>

      {/* Desktop: avatar + icon → dropdown */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 90 }}>
        {logged ? (
          <ProfileMenuButton key="account" onClick={handleMenuOpenClick}>
            <Stack
              spacing={1.25}
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
            >
              <MenuIcon fontSize="small" />
              <ProfileAvatar size={28} />
            </Stack>
          </ProfileMenuButton>
        ) : (
          <ProfileMenuButton key="login" onClick={handleLoginClick}>
            {t('Forms.signInTitle')}
          </ProfileMenuButton>
        )}
        <Menu
          disablePortal
          open={open}
          elevation={2}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {items.map((item, index) => (
            <ProfileMenuItem key={index} item={item} />
          ))}
        </Menu>
      </Box>
    </Box>
  )
}
