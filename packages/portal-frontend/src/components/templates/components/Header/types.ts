import type React from 'react'

import { type PopoverOrigin } from '@mui/material'

export type ToolbarItemType = string | ((args: any) => React.JSX.Element | null)

export type ToolbarItem = {
  id?: string // Unique identifier (use "$" prefix for built-in items like "$map")
  if?: boolean // if omitted, we'll assume true
  item: ToolbarItemType
  url?: string
  order?: number // Sort order (if not specified, uses array index)
  children?: DropdownItem[] // Static dropdown children (alternative to using component)
}

export type ProfileMenuItemType = string

export type ProfileMenuItem = {
  id?: string // Unique identifier (use "$" prefix for built-in items)
  if?: boolean // if omitted, we'll assume true
  item: ProfileMenuItemType
  url?: string
  onClick?: () => void // Optional click handler for actions like logout
  order?: number // Sort order (if not specified, uses array index)
  count?: number // Optional badge count shown next to the label
}

// Dropdown menu item
export interface DropdownItem {
  url?: string
  title: string
  count?: number
  children?: DropdownItem[]
  /** Custom rendered content — if set, replaces default item rendering */
  render?: React.ReactNode
}

// Dropdown open trigger type
export type DropdownTrigger = 'click' | 'hover'

// Nested items behavior
export type DropdownVariant = 'dropdown' | 'megamenu'

// Dropdown configuration
export interface DropdownConfig {
  // Open trigger type
  trigger: DropdownTrigger
  // Dropdown display variant
  variant: DropdownVariant
  // Anchor position for root dropdowns
  anchorOrigin: PopoverOrigin
  transformOrigin: PopoverOrigin
  // Anchor position for nested dropdowns
  nestedAnchorOrigin: PopoverOrigin
  nestedTransformOrigin: PopoverOrigin
}
