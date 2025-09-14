import { type ApiNeighborhood } from 'services/API'
import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { maxChilds } from '../constants'

import { GroupTemplate } from '.'

const HoodsOfCity = ({
  hoods,
  city
}: {
  hoods: ApiNeighborhood[]
  city: string
}) => {
  if (!city || !hoods.length) return null

  const items = hoods
    .filter(({ name }) => name !== city.toLowerCase())
    .slice(0, maxChilds)

  return (
    <GroupTemplate
      title={`Neighborhoods of ${city}`}
      items={items.map(({ name, activeCount }) => ({
        name: capitalize(name),
        link: getCatalogUrl(city, name),
        count: activeCount
      }))}
    />
  )
}

export default HoodsOfCity
