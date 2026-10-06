'use client'

import { useFavorites } from 'providers/FavoritesProvider'
import { useUser } from 'providers/UserProvider'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

export const FavoritesMenuItem = ({ url }: { url: string }) => {
  const { logged } = useUser()
  const { list } = useFavorites()

  const count = (logged && list?.length) || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title="Favorites" url={url} />
    </ToolbarMenuItemBadge>
  )
}
