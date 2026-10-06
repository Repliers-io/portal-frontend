import React from 'react'
import Link from 'next/link'

import { ListItemButton, ListItemText } from '@mui/material'

import { ChevronRightIcon } from '@configs/icons'

import { type DropdownItem } from '../../types'
import { ToolbarMenuItemBadge } from '../ToolbarMenu/components/ToolbarMenuItemBadge'

interface MobileMegaMenuItemProps {
  item: DropdownItem
  onEnter: (item: DropdownItem) => void
  onClose: () => void
}

const sx = {
  fontWeight: 800,
  fontSize: '14px',
  letterSpacing: '1.1px',
  fontFamily: 'var(--font-primary), sans-serif',
  textTransform: 'uppercase'
} as const

/**
 * Single row in the mobile mega menu panel.
 * - Items with children: shows ChevronRight, calls onEnter to drill in
 * - Items with url only: renders as Next.js Link, calls onClose after click
 */
export const MobileMegaMenuItem = ({
  item,
  onEnter,
  onClose
}: MobileMegaMenuItemProps) => {
  const { title, url, children, render, count } = item
  const hasChildren = !!children?.length

  if (render !== undefined) {
    return <>{render}</>
  }

  return (
    <ListItemButton
      {...(hasChildren
        ? { onClick: () => onEnter(item) }
        : url
          ? { component: Link, href: url, onClick: onClose }
          : { disabled: true })}
      sx={{ px: 2, py: 1, borderRadius: 1 }}
    >
      <ListItemText primary={title} slotProps={{ primary: { sx } }} />
      {!!count && <ToolbarMenuItemBadge count={count} color="primary" inline />}
      {hasChildren && (
        <ChevronRightIcon
          fontSize="small"
          sx={{ color: 'text.secondary', ml: 1 }}
        />
      )}
    </ListItemButton>
  )
}
