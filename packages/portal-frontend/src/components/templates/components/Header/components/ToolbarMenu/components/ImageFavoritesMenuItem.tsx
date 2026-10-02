'use client'

import { useTranslations } from 'next-intl'

import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useUser } from 'providers/UserProvider'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

export const ImageFavoritesMenuItem = ({ url }: { url: string }) => {
  const { logged } = useUser()
  const { images } = useImageFavorites()
  const t = useTranslations('Menu')

  const count = (logged && images.length) || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title={t('imageFavorites')} url={url} />
    </ToolbarMenuItemBadge>
  )
}
