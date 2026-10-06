'use client'

import { useTranslations } from 'next-intl'

import { useSaveSearch } from 'providers/SaveSearchProvider'
import { useUser } from 'providers/UserProvider'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

export const SaveSearchMenuItem = ({ url }: { url: string }) => {
  const { logged } = useUser()
  const { list } = useSaveSearch()
  const t = useTranslations('Menu')

  const count = (logged && list?.length) || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title={t('saveSearch')} url={url} />
    </ToolbarMenuItemBadge>
  )
}
