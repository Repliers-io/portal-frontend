import { getCatalogUrl } from 'utils/urls'

import { popularCities } from '../constants'

import { GroupTemplate } from '.'

const PopularCities = () => {
  const items = popularCities.map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        link: getCatalogUrl(item)
      }
    }
    const [city, name] = item
    return {
      name,
      link: getCatalogUrl(city, name)
    }
  })

  return (
    <GroupTemplate title="Popular Cities" items={items} direction="column" />
  )
}

export default PopularCities
