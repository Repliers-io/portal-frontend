import { useTranslations } from 'next-intl'

import { EmptyListingsIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyListings = () => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate icon={<EmptyListingsIcon />} title={t('Listings.title')}>
      {t('Listings.description')}
    </EmptyTemplate>
  )
}
