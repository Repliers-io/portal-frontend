import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'

import { type LocationWithDistance } from 'services/LocationsTree'
import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

import { GroupTemplate } from '.'

const { maxNearbies } = locationConfig

export const NearbyLocations = ({
  locations,
  city,
  hood,
  hideEmpty = true
}: {
  locations: LocationWithDistance[]
  city?: string
  hood?: string
  hideEmpty?: boolean
}) => {
  const t = useTranslations('Locations')

  if (!hood && !city) return null
  if (!locations.length) return null

  const items = locations.filter((l) => !hideEmpty || l.activeCount)

  return (
    <GroupTemplate
      direction="column"
      title={t(hood ? 'nearbyHoods' : 'nearbyCities')}
      items={items
        .slice(0, maxNearbies)
        .map(({ name, distance, activeCount, city: hoodCity }) => {
          return {
            name: capitalize(name),
            distance,
            activeCount,
            // Neighbours cross city lines: a hood links through its own city,
            // not the one currently on screen.
            link: hood
              ? getLocationUrl({ city: hoodCity ?? city, hood: name })
              : getLocationUrl({ city: name })
          }
        })}
    />
  )
}
