import React from 'react'

import { Box, lighten, MenuItem } from '@mui/material'

import palette from '@configs/theme/palette'
import { ToolbarMenuItemBadge } from '@templates/components/Header/components/ToolbarMenu'

export const AdvancedFiltersMenuItem = ({
  activeColor = 'primary',
  selectedColor = palette[activeColor].main,
  selected,
  onClick,
  count = 0,
  startIcon,
  children
}: {
  count?: number
  selected?: boolean
  activeColor?: 'primary' | 'secondary'
  // the selected tab's text, hover tint and underline, when they leave the palette
  selectedColor?: string
  onClick?: () => void
  startIcon?: React.ReactNode
  children: React.ReactNode
}) => (
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
        minWidth: 0,

        // a touch screen keeps `:hover` on the tapped tab until the next tap, so the
        // tint (and MUI's own touch tint) gives way to the plain ground there
        '&.Mui-selected:hover': {
          bgcolor: 'common.white',
          '@media (hover: hover)': { bgcolor: lighten(selectedColor, 0.95) }
        },

        '&.Mui-selected': {
          color: selectedColor,
          bgcolor: 'common.white'
        },

        '&.Mui-selected::after': {
          content: '""',
          left: 0,
          right: 0,
          height: 4,
          bottom: { xs: -8, sm: -14 },
          position: 'absolute',
          bgcolor: selectedColor,
          borderRadius: '4px 4px 0 0',
          pointerEvents: 'none'
        }
      }}
    >
      {/* The label goes first in a reversed wrapping row, so a tab too narrow for
          both wraps its icon onto the second line, clipped at one line's height; the
          label is cut with an ellipsis only once it alone no longer fits. The clip is
          on this row: the item keeps its overflow for the underline below. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row-reverse',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: 1,
          height: '1lh',
          overflow: 'hidden'
        }}
      >
        <Box
          component="span"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {children}
        </Box>
        {startIcon}
      </Box>
    </MenuItem>
  </ToolbarMenuItemBadge>
)
