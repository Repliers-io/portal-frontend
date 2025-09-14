import React from 'react'

import { lighten, MenuItem, Stack } from '@mui/material'

import palette from '@configs/theme/palette'
import { ToolbarMenuItemBadge } from '@templates/Header/components/ToolbarMenu'

const AdvancedFiltersMenuItem = ({
  activeColor = 'primary',
  selected,
  onClick,
  count = 0,
  startIcon,
  children
}: {
  count?: number
  selected?: boolean
  activeColor?: 'primary' | 'secondary'
  onClick?: () => void
  startIcon?: React.ReactNode
  children: React.ReactNode
}) => {
  const themeColor = palette[activeColor].main

  return (
    <ToolbarMenuItemBadge color={activeColor} count={count}>
      <MenuItem
        component="a"
        selected={selected}
        onClick={onClick}
        sx={{
          px: { xs: 1, sm: 1.5 },
          lineHeight: 2,
          borderRadius: 1,
          position: 'relative',
          display: 'inline-block',

          '&.Mui-selected:hover': {
            bgcolor: lighten(themeColor, 0.95)
          },

          '&.Mui-selected': {
            color: themeColor,
            bgcolor: 'common.white'
          },

          '&.Mui-selected::after': {
            content: '""',
            left: 0,
            right: 0,
            height: 4,
            bottom: { xs: -8, sm: -14 },
            position: 'absolute',
            bgcolor: themeColor,
            borderRadius: '4px 4px 0 0',
            pointerEvents: 'none'
          }
        }}
      >
        <Stack spacing={1} direction="row" alignItems="center">
          {startIcon}
          {children}
        </Stack>
      </MenuItem>
    </ToolbarMenuItemBadge>
  )
}

export default AdvancedFiltersMenuItem
