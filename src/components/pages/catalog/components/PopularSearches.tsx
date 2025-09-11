import defaultLocation from '@configs/location'

import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import GroupTemplate from './GroupTemplate'

const filters = [
  ['houses', 'for-sale'],
  ['condos', 'for-sale'],
  ['townhomes', 'for-sale'],

  ['houses', 'for-rent'],
  ['condos', 'for-rent'],
  ['houses', 'above-800k'],

  ['condos', 'above-500k'],
  ['2-bedrooms', 'houses', 'for-sale'],
  ['3-bedrooms', 'houses', 'for-sale'],

  ['4-bedrooms', 'houses', 'for-sale'],
  ['3-bathrooms', 'houses', 'for-sale'],
  ['3-garages', 'houses', 'for-sale']
]

const formatLabel = (label: string) =>
  capitalize(label.replace('-', ' ')).replace(
    /(\d+(\.\d+)?)([km])/,
    (_, num, __, suffix) => `${num}${suffix.toUpperCase()}`
  )

const PopularSearches = ({ city, hood }: { city?: string; hood?: string }) => {
  const items = filters.map((filterItems) => {
    const regionName = capitalize(hood || city || defaultLocation.state)
    const formattedFilters = capitalize(filterItems.map(formatLabel).join(' '))

    return {
      name: `${formattedFilters} in ${regionName}`,
      link: getCatalogUrl(city, hood, filterItems)
    }
  })

  return (
    <GroupTemplate title="Popular Searches" items={items} direction="column" />
  )
}

export default PopularSearches
