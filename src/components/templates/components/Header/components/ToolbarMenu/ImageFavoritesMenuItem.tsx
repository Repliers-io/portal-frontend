'use client'

import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useUser } from 'providers/UserProvider'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

const ImageFavoritesMenuItem = ({ url }: { url: string }) => {
  const { logged } = useUser()
  const { images } = useImageFavorites()

  const count = (logged && images.length) || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title="Image Favorites" url={url} />
    </ToolbarMenuItemBadge>
  )
}

export default ImageFavoritesMenuItem
