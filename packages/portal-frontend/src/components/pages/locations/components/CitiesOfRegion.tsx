'use client'

import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { type ApiLocation } from 'services/API'
import { useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from '.'

const { maxChilds } = locationConfig

export const CitiesOfRegion = ({
  cities,
  basePrefix
}: {
  cities: ApiLocation[]
  basePrefix?: string
}) => {
  const t = useTranslations('Locations')
  // The heading names whatever owns the listed cities: the area when the page is
  // scoped to one, the state otherwise. Never the current city — on a city page
  // this group still lists the whole state's cities.
  const { area } = useLocationPage()

  if (!cities.length) return null

  const items = cities.slice(0, maxChilds)

  return (
    <GroupTemplate
      direction="column"
      title={t('citiesOfRegion', {
        state: capitalize(area || locationConfig.state)
      })}
      items={items.map(({ name }) => ({
        name: capitalize(name),
        link: getLocationUrl({ city: name, basePrefix })
      }))}
    />
  )
}
