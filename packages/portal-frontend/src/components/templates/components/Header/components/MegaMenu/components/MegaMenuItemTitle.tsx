import React from 'react'
import Link from 'next/link'

import { Typography } from '@mui/material'

import { type DropdownItem } from '../../../types'

import { type TitleLayoutConfig } from './utils'

interface MegaMenuItemTitleProps {
  item: DropdownItem
  layout: TitleLayoutConfig
  onItemClick?: (item: DropdownItem) => void
}

/**
 * MegaMenuItemTitle - Renders a title that can be either a link or plain text
 *
 * Responsibilities:
 * - Render title as link if item has url
 * - Apply correct typography variant
 * - Handle click events
 * - Apply level-specific padding
 */
export const MegaMenuItemTitle = ({
  item,
  layout,
  onItemClick
}: MegaMenuItemTitleProps) => {
  const link = Boolean(item.url)

  return (
    <Typography
      variant={layout.variant}
      href={link ? item.url : undefined}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener' : undefined}
      component={link ? Link : 'span'}
      onClick={() => link && onItemClick?.(item)}
      sx={{
        display: 'inline-block',
        ...layout.sx,
        ...(link && {
          color: 'text.primary',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        })
      }}
    >
      {item.title}
    </Typography>
  )
}
