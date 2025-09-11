'use client'

import { useSaveSearch } from 'providers/SaveSearchProvider'
import { useUser } from 'providers/UserProvider'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

const SaveSearchMenuItem = ({ url }: { url: string }) => {
  const { logged } = useUser()
  const { list } = useSaveSearch()

  const count = (logged && list?.length) || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title="Saved Searches" url={url} />
    </ToolbarMenuItemBadge>
  )
}

export default SaveSearchMenuItem
