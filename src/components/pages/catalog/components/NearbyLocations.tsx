import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { maxNearbies } from '../constants'

import { GroupTemplate } from '.'

const NearbyLocations = ({
  locations,
  city,
  hood
}: {
  locations: any[]
  city?: string
  hood?: string
}) => {
  if (!hood && !city) return null
  if (!locations.length) return null

  return (
    <GroupTemplate
      direction="column"
      title={hood ? 'Nearby Neighbourhoods' : 'Nearby Cities'}
      items={locations
        .slice(0, maxNearbies)
        .map(({ name, distance, activeCount }) => {
          const args = hood ? [city, name] : [name]
          return {
            name: capitalize(name),
            distance,
            activeCount,
            link: getCatalogUrl(...args)
          }
        })}
    />
  )
}

export default NearbyLocations
