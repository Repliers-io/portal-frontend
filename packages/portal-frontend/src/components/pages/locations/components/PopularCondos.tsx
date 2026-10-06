import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { GroupTemplate } from '.'

export const PopularCondos = () => {
  const { popularCondos } = locationConfig
  const t = useTranslations('Locations')

  if (!popularCondos?.length) return null

  const items = popularCondos.map((item) => {
    const [name, link] = item as [string, string]
    return { name, link }
  })

  return (
    <GroupTemplate
      title={t('popularCondos')}
      items={items}
      direction="column"
    />
  )
}
