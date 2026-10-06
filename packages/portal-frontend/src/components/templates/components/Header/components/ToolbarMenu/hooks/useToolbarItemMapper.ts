import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import features from '@configs/features'
import routes from '@configs/routes'
import { type ToolbarItem } from '@templates/components/Header'

import { useUser } from 'providers/UserProvider'

import {
  FavoritesMenuItem,
  ImageFavoritesMenuItem,
  RecentlyViewedMenuItem,
  SaveSearchMenuItem,
  ToolbarDivider,
  WordPressMenuItem
} from '../components'

/**
 * Hook that returns a mapper for built-in toolbar menu items
 * Resolves items with "$" prefix to their full configuration
 */
export const useToolbarItemMapper = () => {
  const t = useTranslations('Menu')
  const { adminRole } = useUser()

  return useMemo<Record<string, ToolbarItem>>(
    () => ({
      $map: {
        if: features.map,
        url: routes.map,
        item: t('map')
      },
      $locations: {
        if: features.locations,
        url: routes.locations,
        item: t('locations')
      },
      $estimate: {
        if: features.estimate && !adminRole,
        url: routes.estimate,
        item: t('estimate')
      },
      $dashboard: {
        if: features.dashboard,
        url: routes.dashboard,
        item: t('dashboard')
      },
      $blog: {
        if: features.blog,
        url: routes.blog,
        item: t('blog')
      },
      $divider: {
        item: ToolbarDivider
      },
      $cmsMenu: {
        if: features.blog,
        item: WordPressMenuItem
      },
      $favorites: {
        if: features.favorites,
        url: routes.favorites,
        item: FavoritesMenuItem
      },
      $saveSearch: {
        if: features.saveSearch,
        url: routes.saveSearch,
        item: SaveSearchMenuItem
      },
      $imageFavorites: {
        if: features.favorites,
        url: routes.favorites,
        item: ImageFavoritesMenuItem
      },
      $recentlyViewed: {
        url: routes.recentlyViewed,
        item: RecentlyViewedMenuItem
      },
      $adminAgents: {
        if: adminRole,
        url: routes.adminAgents,
        item: t('adminAgents')
      },
      $adminClients: {
        if: adminRole,
        url: routes.agent,
        item: t('adminClients')
      }
    }),
    [adminRole, t]
  )
}
