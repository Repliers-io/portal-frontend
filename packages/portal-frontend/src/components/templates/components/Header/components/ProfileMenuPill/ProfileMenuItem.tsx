'use client'

import { MenuItem, Stack } from '@mui/material'

import { type ProfileMenuItem as ProfileMenuItemType } from '@templates/components/Header'

import { ToolbarMenuItemBadge } from '../ToolbarMenu/components/ToolbarMenuItemBadge'

export const ProfileMenuItem = ({ item }: { item: ProfileMenuItemType }) => (
  <MenuItem
    component={item.onClick ? 'li' : 'a'}
    href={item.onClick ? undefined : item.url}
    onClick={item.onClick}
  >
    <Stack
      spacing={2}
      width="100%"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.25 }}
    >
      {item.item}
      {!!item.count && (
        <ToolbarMenuItemBadge count={item.count} color="primary" inline />
      )}
    </Stack>
  </MenuItem>
)
