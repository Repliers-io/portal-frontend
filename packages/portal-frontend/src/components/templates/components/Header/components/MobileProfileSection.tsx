'use client'

import { List, ListItemButton, ListItemText } from '@mui/material'

import { useUser } from 'providers/UserProvider'

import { ProfileAvatar } from '../..'

import { useProfileMenuMapper } from './ProfileMenuPill/hooks/useProfileMenuMapper'
import { ToolbarMenuItemBadge } from './ToolbarMenu/components/ToolbarMenuItemBadge'

export const MobileProfileSection = () => {
  const { logged, logout, profile } = useUser()
  const items = useProfileMenuMapper(logout)

  if (!logged) return null

  const navItems = items.filter((item) => item.if !== false && !!item.url)
  if (navItems.length === 0) return null

  const fullName = [profile?.fname, profile?.lname].filter(Boolean).join(' ')

  return (
    <List sx={{ pt: 0, pb: 1, px: 0 }}>
      <ListItemButton
        disableRipple
        sx={{
          px: 2,
          py: 1,
          cursor: 'default',
          bgcolor: 'background.default',
          mb: 1
        }}
      >
        <ProfileAvatar size={28} />
        {fullName && <ListItemText sx={{ ml: 2 }} primary={fullName} />}
      </ListItemButton>
      {navItems.map((item, index) => (
        <ListItemButton
          key={index}
          href={String(item.url)}
          sx={{ px: 2, py: 0.5 }}
        >
          <ListItemText primary={String(item.item)} />
          {!!item.count && (
            <ToolbarMenuItemBadge count={item.count} color="primary" inline />
          )}
        </ListItemButton>
      ))}
    </List>
  )
}
