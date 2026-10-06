'use client'

import React from 'react'

import { MenuList, type SxProps } from '@mui/material'

import { type ToolbarItem } from '@templates/components/Header'

import { type CmsMenuItem } from 'services/CMS'

import { DropdownMenu } from '../DropdownMenu'

import { ToolbarMenuItem } from './components'

type ToolbarMenuProps = {
  items: ToolbarItem[]
  cmsItems?: CmsMenuItem[]
  sx?: SxProps
}

export const ToolbarMenu = ({ items, cmsItems, sx }: ToolbarMenuProps) => {
  // WARN: special case of the SPA with 'estimate' only feature
  // Also check if we have CMS items since WordPressMenuItem can render multiple items
  if (items.length < 2 && !cmsItems?.length) return null

  return (
    <MenuList
      sx={{
        p: 0,
        gap: 0,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        ...sx
      }}
    >
      {items.map((config, index) => {
        const { item: MenuItem, url = '', children } = config

        // If has children array, render as static dropdown
        if (children?.length && typeof MenuItem === 'string') {
          const menuItem = { title: MenuItem, url, children }
          return <DropdownMenu item={menuItem} key={index} />
        }

        // String item - render as regular menu item
        if (typeof MenuItem === 'string')
          return <ToolbarMenuItem title={MenuItem} url={url} key={index} />

        // Component item (dividers, smart buttons like WordPressMenuItem)
        return <MenuItem items={cmsItems || []} url={url} key={index} />
      })}
    </MenuList>
  )
}
