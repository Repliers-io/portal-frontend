import { useTranslations } from 'next-intl'

import { Button } from '@mui/material'

import { EmptyListingsIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyCatalogListings = ({ onReset }: { onReset?: () => void }) => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate
      icon={<EmptyListingsIcon />}
      title={onReset ? t('Catalog.titleWithFilters') : t('Catalog.title')}
    >
      {onReset && (
        <Button variant="contained" onClick={onReset}>
          {t('Catalog.resetFilters')}
        </Button>
      )}
    </EmptyTemplate>
  )
}
