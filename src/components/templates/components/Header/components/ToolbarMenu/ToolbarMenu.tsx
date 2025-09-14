'use client'

import React, { useMemo } from 'react'

import { MenuList, type SxProps } from '@mui/material'

import content from '@configs/content'
import routes from '@configs/routes'

import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'

import FavoritesMenuItem from './FavoritesMenuItem'
import SaveSearchMenuItem from './SaveSearchMenuItem'
import ToolbarDivider from './ToolbarDivider'
import ToolbarMenuItem from './ToolbarMenuItem'

type ToolbarItemType = string | ((args: any) => React.JSX.Element)

export type ToolbarConfig = {
  if?: boolean // if omitted, we'll assume true
  item: ToolbarItemType
  url?: string
}

const ToolbarMenu = ({ sx }: { sx?: SxProps }) => {
  const features = useFeatures()
  const { adminRole } = useUser()

  const toolbarConfigs = useMemo<ToolbarConfig[]>(() => {
    return [
      {
        if: features.map,
        url: routes.map,
        item: 'Map'
      },
      {
        if: features.listings,
        url: routes.listings,
        item: 'Listings'
      },
      {
        if: features.estimate && !adminRole,
        url: routes.estimate,
        item: 'Estimate'
      },
      {
        if: features.dashboard,
        url: routes.dashboard,
        item: 'Market Insights'
      },
      {
        if: features.favorites || features.saveSearch,
        item: ToolbarDivider
      },
      {
        if: features.favorites,
        url: routes.favorites,
        item: FavoritesMenuItem
      },
      {
        if: features.saveSearch,
        url: routes.saveSearch,
        item: SaveSearchMenuItem
      },
      {
        if: adminRole,
        url: routes.adminAgents,
        item: 'Agents'
      },
      {
        if: adminRole,
        url: routes.agent,
        item: 'Clients'
      },
      ...content.toolbarMenuItems
    ]
  }, [features, adminRole, content.toolbarMenuItems])

  // Filter out items whose condition is false, and map to our tuple type.
  const items = useMemo<[ToolbarItemType, string][]>(() => {
    return toolbarConfigs
      .filter((config) => config.if !== false)
      .map((config) => [config.item, config.url ?? ''])
  }, [toolbarConfigs])

  // WARN: special case of the SPA with 'estimate' only feature
  if (items.length < 2) return null

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
      {items.map(([Item, url], index) =>
        typeof Item === 'string' ? (
          // default case for most of the items
          <ToolbarMenuItem title={Item} url={url} key={index} />
        ) : (
          // dividers and "smart" buttons
          // render custom components as React components
          <Item url={url} key={index} />
        )
      )}
    </MenuList>
  )
}

export default ToolbarMenu
