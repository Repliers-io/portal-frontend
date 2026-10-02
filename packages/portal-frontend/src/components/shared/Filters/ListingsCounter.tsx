import { Typography } from '@mui/material'

import type { Filters } from 'services/Search'
import useBreakpoints from 'hooks/useBreakpoints'
import { pluralize } from 'utils/strings'

export const ListingsCounter = ({
  filters,
  count
}: {
  filters?: Partial<Filters>
  count: number
}) => {
  const { desktop } = useBreakpoints()

  const status = filters?.listingStatus || 'all'

  // `listingType` may be a single key or an array (multi-select). A specific
  // noun only applies when exactly one type is selected; unset or multiple types
  // (and rent, which spans all types) fall back to the generic "listings".
  const selectedTypes =
    status === 'rent' ? [] : [filters?.listingType].flat().filter(Boolean)
  const type = selectedTypes.length === 1 ? selectedTypes[0] : 'allListings'

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
    case 'other':
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
