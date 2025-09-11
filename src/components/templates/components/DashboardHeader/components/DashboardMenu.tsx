import React, { useMemo } from 'react'

import { MenuList } from '@mui/material'

import routes from '@configs/routes'

import { useFeatures } from 'providers/FeaturesProvider'

import {
  FavoritesMenuItem,
  ImageFavoritesMenuItem,
  SaveSearchMenuItem,
  ToolbarMenuItem
} from '../../Header/components/ToolbarMenu'
type DashboardItemType = string | ((args: any) => React.ReactNode)

const DashboardMenu = () => {
  const features = useFeatures()

  const items = useMemo(
    () =>
      [
        features.favorites ? [FavoritesMenuItem, routes.favorites] : null,
        features.saveSearch ? [SaveSearchMenuItem, routes.saveSearch] : null,
        features.imageFavorites
          ? [ImageFavoritesMenuItem, routes.imageFavorites]
          : null,
        ['Recently Viewed', null]
      ].filter(Boolean) as [DashboardItemType, string | null][],
    [features]
  )

  return (
    <MenuList
      sx={{
        display: 'flex',
        gap: { xs: 0, sm: 1, md: 2 },

        '& .MuiMenuItem-root': {
          px: 1.5,
          position: 'relative',
          display: 'inline-block',

          '&.Mui-selected::after': {
            content: '""',
            left: 0,
            right: 0,
            height: 4,
            bottom: { xs: -8, sm: -16 },
            position: 'absolute',
            bgcolor: 'primary.main',
            borderRadius: '4px 4px 0 0',
            pointerEvents: 'none'
          }
        }
      }}
    >
      {items.map(([Item, url], index) =>
        typeof Item === 'string' ? (
          // default case for most of the items
          <ToolbarMenuItem title={Item} url={url} key={index} />
        ) : (
          // dividers and "smart" buttons
          <Item url={url} key={index} />
        )
      )}
    </MenuList>
  )
}

export default DashboardMenu
