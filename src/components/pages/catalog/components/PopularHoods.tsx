import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { popularHoods } from '../constants'

import { GroupTemplate } from '.'

const PopularHoods = () => {
  const items = popularHoods.map((name) => {
    return {
      name: capitalize(name),
      link: getCatalogUrl('toronto', name)
    }
  })

  return (
    <GroupTemplate
      title="Popular Neighbourhoods"
      items={items}
      direction="column"
    />
  )
}

export default PopularHoods
