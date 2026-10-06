import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'
import { type PopularSearch } from '@defaults/location'

import { parseUrlFilters } from 'app/locations/[[...slugs]]/_utils'

import { type Filters } from 'services/Search'
import { useLocationPage } from 'providers/LocationProvider'
import { getMapUrl } from 'utils/map'
import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from './GroupTemplate'

const formatLabel = (label: string) =>
  capitalize(label.replace('-', ' ')).replace(
    /(\d+(\.\d+)?)([km])/,
    (_, num, __, suffix) => `${num}${suffix.toUpperCase()}`
  )

export const PopularSearches = ({
  city,
  hood,
  filtersList,
  linkTarget = 'catalog',
  withLocation = false
}: {
  city?: string
  hood?: string
  filtersList?: PopularSearch[] | null
  linkTarget?: 'catalog' | 'map'
  // Append " in {locationName}" to each label (e.g. "Houses For Sale in Toronto")
  withLocation?: boolean
}) => {
  const t = useTranslations('Locations')
  const { locationName } = useLocationPage()
  const searches =
    filtersList ??
    (locationConfig.popularSearches as PopularSearch[] | undefined)

  if (!searches?.length) return null

  // 'catalog' → human-readable SEO catalog URL; 'map' → standard filter query
  // string for the map (/search/map?…).
  const buildLink = (filters: string[]) =>
    linkTarget === 'map'
      ? getMapUrl({ filters: parseUrlFilters(filters) as Filters })
      : getLocationUrl({ city, hood, filters })

  const items = searches.map((item) => {
    const label = capitalize(item.filters.map(formatLabel).join(' '))
    return {
      name: withLocation ? `${label} in ${locationName}` : label,
      link: buildLink(item.filters)
    }
  })

  const defaultSearches = locationConfig.popularSearches as
    | PopularSearch[]
    | undefined
  const direction =
    filtersList && filtersList.length < (defaultSearches?.length ?? 0)
      ? 'row'
      : 'column'

  return (
    <GroupTemplate
      title={t('popularSearches', { location: locationName })}
      direction={direction}
      items={items}
    />
  )
}
