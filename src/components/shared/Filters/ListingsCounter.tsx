import { Typography } from '@mui/material'

import type { Filters } from 'services/Search'
import useBreakpoints from 'hooks/useBreakpoints'
import { pluralize } from 'utils/strings'

const ListingsCounter = ({
  filters,
  count
}: {
  filters?: Partial<Filters>
  count: number
}) => {
  const { desktop } = useBreakpoints()

  const status = filters?.listingStatus || 'all'
  const type =
    status === 'rent' ? 'allListings' : filters?.listingType || 'allListings'

  let noun: { one: string; many: string }
  switch (type) {
    case 'allListings':
      noun = { one: 'listing', many: 'listings' }
      break
    case 'condo':
      noun = { one: 'condo', many: 'condos' }
      break
    case 'land':
      noun = { one: 'lot', many: 'lots' }
      break
    case 'commercial':
      noun = { one: 'property', many: 'properties' }
      break
    case 'business':
      noun = { one: 'business', many: 'businesses' }
      break
    default:
      noun = { one: 'home', many: 'homes' }
  }

  let action: string
  switch (status) {
    case 'active':
      action = 'available for sale'
      break
    case 'rent':
      action = 'available for rent'
      break
    case 'sold':
      action = `${pluralize(count, { one: 'was', many: 'were' })} sold`
      break
    default:
      action = 'found'
  }

  return (
    <Typography variant="h6" noWrap>
      {count.toLocaleString('en-GB')}{' '}
      <Typography variant="body2" component="span" color="text.hint">
        {pluralize(count, noun)} {desktop && action}
      </Typography>
    </Typography>
  )
}

export default ListingsCounter
