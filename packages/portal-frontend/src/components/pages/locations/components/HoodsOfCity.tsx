import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { type ApiLocation } from 'services/API'
import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from '.'

const { maxChilds } = locationConfig

export const HoodsOfCity = ({
  hoods,
  city,
  counts = false
}: {
  hoods: ApiLocation[]
  city: string
  counts?: boolean
}) => {
  const t = useTranslations('Locations')

  if (!city || !hoods.length) return null

  const items = hoods
    .filter(
      ({ name, activeCount }) =>
        name !== city.toLowerCase() && (activeCount || 0) > 0
    )
    .slice(0, maxChilds)

  return (
    <GroupTemplate
      title={t('hoodsOfCity', { city })}
      items={items.map(({ name, activeCount }) => ({
        name: capitalize(name),
        link: getLocationUrl({ city, hood: name }),
        count: counts ? activeCount : undefined
      }))}
    />
  )
}
