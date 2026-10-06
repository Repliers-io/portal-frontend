'use client'

import { useTranslations } from 'next-intl'

import useRecents from 'hooks/useRecents'

import { ToolbarMenuItem, ToolbarMenuItemBadge } from '.'

export const RecentlyViewedMenuItem = ({ url }: { url: string }) => {
  const { recents } = useRecents()
  const t = useTranslations('Menu')

  const count = recents.length || 0

  return (
    <ToolbarMenuItemBadge count={count} flashing>
      <ToolbarMenuItem title={t('recentlyViewed')} url={url} />
    </ToolbarMenuItemBadge>
  )
}
