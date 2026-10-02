import { useTranslations } from 'next-intl'

import { EmptyFavoritesIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyFavorites = () => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate icon={<EmptyFavoritesIcon />} title={t('Favorites.title')}>
      {t('Favorites.description')}
    </EmptyTemplate>
  )
}
