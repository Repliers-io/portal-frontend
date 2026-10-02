import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import features from '@configs/features'
import menuConfig from '@configs/menu'
import routes from '@configs/routes'
import { type ProfileMenuItem } from '@templates/components/Header'

import { useFavorites } from 'providers/FavoritesProvider'
import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useSaveSearch } from 'providers/SaveSearchProvider'
import { useUser } from 'providers/UserProvider'

export const useProfileMenuMapper = (onSignOut: () => void) => {
  const t = useTranslations('Menu')
  const { logged } = useUser()
  const { images } = useImageFavorites()
  const { list: favorites } = useFavorites()
  const { list: savedSearches } = useSaveSearch()

  const favoritesCount = (logged && favorites?.length) || 0
  const savedSearchesCount = (logged && savedSearches?.length) || 0
  const imageFavoritesCount = (logged && images?.length) || 0

  const mapper: Record<string, ProfileMenuItem> = useMemo(
    () => ({
      $favorites: {
        item: t('favorites'),
        url: routes.favorites,
        if: features.favorites,
        count: favoritesCount
      },
      $saveSearch: {
        item: t('saveSearch'),
        url: routes.saveSearch,
        if: features.saveSearch,
        count: savedSearchesCount
      },
      $imageFavorites: {
        item: t('imageFavorites'),
        url: routes.imageFavorites,
        if: features.imageFavorites,
        count: imageFavoritesCount
      },
      $recentlyViewed: {
        item: t('recentlyViewed'),
        url: routes.recentlyViewed,
        if: features.recentlyViewed
      },
      $profile: {
        item: t('accountSettings'),
        url: routes.profile,
        if: features.profile
      },
      $signOut: { item: t('signOut'), onClick: onSignOut }
    }),
    [favoritesCount, imageFavoritesCount, onSignOut, savedSearchesCount, t]
  )

  return useMemo(
    () =>
      menuConfig.profile
        .map((cfg) =>
          typeof cfg.item === 'string' && cfg.item in mapper
            ? mapper[cfg.item]
            : cfg
        )
        .filter((item) => item.if !== false),
    [mapper]
  )
}
