import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from '.'

export const PopularCities = ({ basePrefix }: { basePrefix?: string } = {}) => {
  const { popularCities } = locationConfig
  const t = useTranslations('Locations')

  if (!popularCities?.length) return null

  const items = popularCities.map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        link: getLocationUrl({ city: item, basePrefix })
      }
    }
    const [city, name] = item as [string, string]
    return {
      name,
      link: getLocationUrl({ city, hood: name, basePrefix })
    }
  })

  return (
    <GroupTemplate
      title={t('popularCities')}
      items={items}
      direction="column"
    />
  )
}
