'use client'

import React, { useEffect, useState } from 'react'

import { MenuItem } from '@mui/material'

import menuConfig from '@configs/menu'

import { type DropdownItem } from '../../types'

import { DropdownMenu } from './DropdownMenu'

interface DropdownMenuContentProps {
  level: number
  items: DropdownItem[]
  parentClosing?: boolean
  onItemClick: (item: DropdownItem) => void
  onChildOpenChange?: (hasOpenChild: boolean) => void
}

export const DropdownMenuContent = ({
  items,
  level,
  onItemClick,
  parentClosing,
  onChildOpenChange
}: DropdownMenuContentProps) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  useEffect(() => {
    if (parentClosing) {
      setOpenItemId(null)
    }
  }, [parentClosing])

  useEffect(() => {
    if (onChildOpenChange) {
      onChildOpenChange(openItemId !== null)
    }
  }, [openItemId, onChildOpenChange])

  const handleItemClick = (item: DropdownItem) => {
    onItemClick(item)
  }

  const handleToggle = (itemKey: string, open: boolean) => {
    setOpenItemId(open ? itemKey : null)
  }

  // Standard list render
  return (
    <>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0

        // If has children and dropdown variant - render nested dropdown
        if (hasChildren && menuConfig.dropdown.variant === 'dropdown') {
          return (
            <DropdownMenu
              item={item}
              level={level}
              key={item.title}
              onItemClick={onItemClick}
              open={openItemId === item.title}
              onToggle={(open) => handleToggle(item.title, open)}
              parentClosing={parentClosing}
            />
          )
        }

        // Regular item without children
        return (
          <MenuItem
            component="a"
            key={item.title}
            href={item.url || undefined}
            onClick={() => handleItemClick(item)}
          >
            {item.title}
          </MenuItem>
        )
      })}
    </>
  )
}
