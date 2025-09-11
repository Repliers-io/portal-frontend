'use client'

import React, { useMemo, useState } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import {
  Box,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  type SxProps
} from '@mui/material'

import routes from '@configs/routes'

import { useDialogContext } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import ProfileAvatar from '../../ProfileAvatar'

import ProfileMenuButton from './ProfileMenuButton'

type MenuConfig = {
  if?: boolean // if omitted, we'll assume true
  item: string
  href: string
}

const ProfileMenuPill = ({ sx }: { sx?: SxProps }) => {
  const features = useFeatures()
  const clientSide = useClientSide()
  const { showDialog } = useDialogContext()
  const { logged, logout } = useUser()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const menuConfigs = useMemo<MenuConfig[]>(
    () => [
      {
        if: features.favorites,
        href: routes.favorites,
        item: 'Favorites'
      },
      {
        if: features.saveSearch,
        href: routes.saveSearch,
        item: 'Saved Searches'
      },
      {
        if: features.imageFavorites,
        href: routes.imageFavorites,
        item: 'Image Favorites'
      },
      {
        if: features.recentlyViewed,
        href: routes.recentlyViewed,
        item: 'Recently Viewed'
      },
      {
        if: features.profile,
        href: routes.profile,
        item: 'Account Settings'
      }
    ],
    [features]
  )

  const items = useMemo<[string, string][]>(() => {
    return menuConfigs
      .filter((config) => config.if !== false)
      .map((config) => [config.item, config.href])
  }, [menuConfigs])

  const handleClose = () => setAnchorEl(null)
  const handleLoginClick = () => showDialog('auth')
  const handleLogoutClick = async () => {
    handleClose()
    logout()
  }

  const handleMenuOpenClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Box sx={sx}>
      <Box sx={{ minWidth: 88 }}>
        {!clientSide ? (
          <Skeleton variant="rounded" height={44} width={88} />
        ) : logged ? (
          <ProfileMenuButton
            key="account"
            onClick={handleMenuOpenClick}
            sx={{ px: 1, fontWeight: 500 }}
          >
            <Stack
              spacing={1.5}
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
            Sign in
          </ProfileMenuButton>
        )}
      </Box>
      <Menu
        open={open}
        elevation={2}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 50,
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {items.map(([item, href], index) => (
          <MenuItem key={index} href={href} component="a">
            {item}
          </MenuItem>
        ))}
        <MenuItem key="signout" onClick={handleLogoutClick}>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProfileMenuPill
