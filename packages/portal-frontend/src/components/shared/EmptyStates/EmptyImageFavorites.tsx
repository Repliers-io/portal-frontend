import { useTranslations } from 'next-intl'

import { EmptyImageFavoritesIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyImageFavorites = () => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate
      icon={<EmptyImageFavoritesIcon />}
      title={t('ImageFavorites.title')}
    >
      {t('ImageFavorites.description')}
    </EmptyTemplate>
  )
}
