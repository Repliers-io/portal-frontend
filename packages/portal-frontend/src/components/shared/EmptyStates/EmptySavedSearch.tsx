import { useTranslations } from 'next-intl'

import { EmptyListingsIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptySavedSearch = () => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate icon={<EmptyListingsIcon />} title={t('SavedSearch.title')}>
      {t('SavedSearch.description')}
    </EmptyTemplate>
  )
}
