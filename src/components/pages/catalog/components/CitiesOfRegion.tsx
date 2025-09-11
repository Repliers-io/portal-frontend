import defaultLocation from '@configs/location'

import { type ApiBoardCity } from 'services/API'
import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { maxChilds } from '../constants'

import { GroupTemplate } from '.'

const CitiesOfRegion = ({ cities }: { cities: ApiBoardCity[] }) => {
  if (!cities.length) return null

  const items = cities.slice(0, maxChilds)

  return (
    <GroupTemplate
      direction="column"
      title={`Cities of ${defaultLocation.state}`}
      items={items.map(({ name }) => ({
        name: capitalize(name),
        link: getCatalogUrl(name)
      }))}
    />
  )
}

export default CitiesOfRegion
