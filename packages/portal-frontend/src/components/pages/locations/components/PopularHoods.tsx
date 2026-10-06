import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from '.'

export const PopularHoods = () => {
  const { popularHoods } = locationConfig
  const t = useTranslations('Locations')

  if (!popularHoods?.length) return null

  const items = popularHoods.map((name) => {
    return {
      name: capitalize(name),
      link: getLocationUrl({ city: locationConfig.city, hood: name })
    }
  })

  return (
    <GroupTemplate title={t('popularHoods')} items={items} direction="column" />
  )
}
