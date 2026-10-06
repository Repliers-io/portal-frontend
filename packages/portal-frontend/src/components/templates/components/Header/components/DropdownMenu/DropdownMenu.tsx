'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Menu, MenuItem } from '@mui/material'

import { ChevronRightIcon, ExpandMoreIcon } from '@configs/icons'
import menuConfig from '@configs/menu'

import { type DropdownItem } from '../../types'
import { ToolbarMenuItem } from '../ToolbarMenu'

import { DropdownMenuContent } from './DropdownMenuContent'

const { dropdown } = menuConfig

// Props for base dropdown item
export interface DropdownMenuProps {
  item: DropdownItem
  level?: number
  onItemClick?: (item: DropdownItem) => void
  // For nested behavior (controlled)
  open?: boolean
  onToggle?: (open: boolean) => void
  parentClosing?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const DropdownMenu = ({
  item,
  level = 0,
  onItemClick,
  open: controlledOpen,
  onToggle,
  parentClosing
}: DropdownMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [hasOpenChild, setHasOpenChild] = useState(false)
  const menuItemRef = useRef<HTMLLIElement>(null)
  const openTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const nested = level > 0
  const controlled = controlledOpen !== undefined && onToggle !== undefined
  const open = controlled ? controlledOpen : internalOpen
  const hasChildren = item.children && item.children.length > 0
  const megaMenu = dropdown.variant === 'megamenu' && !nested
  const hoverMode = dropdown.trigger === 'hover'

  const setOpen = (value: boolean) => {
    if (controlled) onToggle(value)
    else setInternalOpen(value)
  }

  const triggerMegaMenu = (type: 'enter' | 'leave') => {
    if (!megaMenu) return
    window.dispatchEvent(
      new CustomEvent('MegaMenu:trigger', { detail: { item, type } })
    )
  }

  // Sync anchorEl with open state for nested items
  useEffect(() => {
    if (megaMenu) return
    if (nested) {
      if (open && !anchorEl && menuItemRef.current) {
        setAnchorEl(menuItemRef.current)
      } else if (!open && anchorEl) {
        // Don't clear anchorEl immediately to prevent flickering
        const timer = setTimeout(() => setAnchorEl(null), 50)
        return () => clearTimeout(timer)
      }
    }
  }, [open, anchorEl, nested])

  // Handle parent closing for nested items
  useEffect(() => {
    if (megaMenu) return
    if (parentClosing && controlled) {
      setClosing(true)
      onToggle(false)
    }
  }, [parentClosing, controlled, onToggle, megaMenu])

  // Listen to MegaMenu container events
  useEffect(() => {
    if (!megaMenu) return

    const handleOtherItemOpened = (e: Event) => {
      const event = e as CustomEvent<{ item: DropdownItem; type: string }>
      // Close this item if another item is being opened (compare by title)
      if (
        event.detail.type === 'enter' &&
        event.detail.item.title !== item.title
      ) {
        setOpen(false)
      }
    }

    const handleMegaMenuEnter = () => {
      if (hoverMode) clearTimeout(closeTimeoutRef.current)
    }

    const handleMegaMenuLeave = () => {
      if (hoverMode) setOpen(false)
    }

    const handleMegaMenuClosed = () => {
      setOpen(false)
    }

    window.addEventListener('MegaMenu:trigger', handleOtherItemOpened)
    window.addEventListener('MegaMenu:mouseenter', handleMegaMenuEnter)
    window.addEventListener('MegaMenu:mouseleave', handleMegaMenuLeave)
    window.addEventListener('MegaMenu:closed', handleMegaMenuClosed)
    return () => {
      window.removeEventListener('MegaMenu:trigger', handleOtherItemOpened)
      window.removeEventListener('MegaMenu:mouseenter', handleMegaMenuEnter)
      window.removeEventListener('MegaMenu:mouseleave', handleMegaMenuLeave)
      window.removeEventListener('MegaMenu:closed', handleMegaMenuClosed)
    }
  }, [])

  const handleClose = () => {
    if (hasOpenChild && !nested) {
      setClosing(true)
      setTimeout(() => {
        setOpen(false)
        setAnchorEl(null)
        setClosing(false)
      }, 200)
    } else {
      setClosing(true)
      setOpen(false)
      if (!nested) setAnchorEl(null)
      setClosing(false)
    }
  }

  const handleItemSelect = (clickedItem: typeof item) => {
    handleClose()
    onItemClick?.(clickedItem)
  }

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!hasChildren || menuConfig.dropdown.trigger !== 'click') return

    e.preventDefault()
    e.stopPropagation()

    if (megaMenu) {
      // Toggle megamenu on click
      if (open) {
        setOpen(false)
        triggerMegaMenu('leave')
      } else {
        setOpen(true)
        triggerMegaMenu('enter')
      }
      return
    }

    if (!nested) {
      if (anchorEl) {
        setAnchorEl(null)
        setOpen(false)
      } else {
        setAnchorEl(e.currentTarget)
        setOpen(true)
      }
    } else {
      setOpen(!open)
    }
  }

  const handleItemClick = (e: React.MouseEvent<HTMLElement>) => {
    if (hasChildren) handleClick(e)
    else handleItemSelect(item)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!hasChildren || !hoverMode) return

    clearTimeout(closeTimeoutRef.current)
    clearTimeout(openTimeoutRef.current)

    if (megaMenu) {
      setOpen(true)
      triggerMegaMenu('enter')
      return
    }

    // Set anchor immediately to prevent positioning issues
    if (!nested) setAnchorEl(e.currentTarget)

    // Open with delay
    openTimeoutRef.current = setTimeout(() => setOpen(true), 150)
  }

  const handleMouseLeave = () => {
    if (!hasChildren || !hoverMode) return

    clearTimeout(openTimeoutRef.current)

    if (megaMenu) {
      triggerMegaMenu('leave')
      // Add timer like in dropdown to allow mouse movement to megamenu
      closeTimeoutRef.current = setTimeout(() => setOpen(false), 0)
      return
    }

    // For root level, add tiny delay to allow switching between menu items
    if (!nested) {
      closeTimeoutRef.current = setTimeout(() => {
        setOpen(false)
        setAnchorEl(null)
      }, 100)
    }
  }

  const handlePaperMouseEnter = () => {
    if (!hoverMode) return
    clearTimeout(closeTimeoutRef.current)
  }

  const handlePaperMouseLeave = () => {
    if (!hoverMode) return
    // Close when leaving menu
    setOpen(false)
    if (!nested) setAnchorEl(null)
  }

  const anchorOrigin = nested
    ? dropdown.nestedAnchorOrigin
    : dropdown.anchorOrigin

  const transformOrigin = nested
    ? dropdown.nestedTransformOrigin
    : dropdown.transformOrigin

  return (
    <>
      {nested ? (
        <MenuItem
          ref={menuItemRef}
          {...(item.url && {
            component: 'a',
            href: item.url
          })}
          onClick={handleItemClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            gap: 1.5,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: hasChildren && open ? 'action.hover' : 'inherit'
          }}
        >
          {item.title}
          {hasChildren &&
            (open ? (
              <ExpandMoreIcon fontSize="small" sx={{ mr: -0.5 }} />
            ) : (
              <ChevronRightIcon fontSize="small" sx={{ mr: -0.5 }} />
            ))}
        </MenuItem>
      ) : (
        <ToolbarMenuItem
          selected={open}
          url={item.url}
          title={item.title}
          onClick={handleClick}
          hasChildren={hasChildren}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-megamenu-trigger={megaMenu || undefined}
        />
      )}
      {hasChildren && (
        <Menu
          id={`dropdown-menu-${item.title}`}
          anchorEl={anchorEl}
          open={open && Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          disablePortal
          slotProps={{
            root: {
              sx: { pointerEvents: hoverMode ? 'none' : 'auto' }
            },
            paper: {
              onMouseEnter: handlePaperMouseEnter,
              onMouseLeave: handlePaperMouseLeave,
              sx: {
                pointerEvents: 'auto',
                ...(nested ? { ml: -1, mt: -1 } : {})
              }
            }
          }}
          sx={nested ? { pointerEvents: 'none' } : {}}
        >
          <DropdownMenuContent
            items={item.children!}
            level={level + 1}
            onItemClick={handleItemSelect}
            parentClosing={closing || parentClosing}
            onChildOpenChange={nested ? undefined : setHasOpenChild}
          />
        </Menu>
      )}
    </>
  )
}
