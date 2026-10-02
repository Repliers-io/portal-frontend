import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { useListing } from 'providers/ListingProvider'
import { listingCity } from 'utils/listings'
import { getLocationUrl } from 'utils/urls'

interface ListingBreadcrumbsProps {
  embedded?: boolean
}

export const ListingBreadcrumbs = ({
  embedded = false
}: ListingBreadcrumbsProps) => {
  const {
    listing: { address }
  } = useListing()
  const { area, neighborhood, state } = address
  const city = listingCity(address)

  const items: BreadcrumbItem[] = []

  if (state) {
    const stateHref = locationConfig.useStateCodeRoute
      ? `/${locationConfig.stateCode.toLowerCase()}`
      : routes.locations

    items.push({
      label: locationConfig.state,
      href: stateHref
    })
  }

  if (area && locationConfig.showAreas) {
    items.push({
      label: `${area} Area`,
      href: getLocationUrl({ area })
    })
  }

  if (city) {
    items.push({
      label: city,
      href: getLocationUrl({ area, city })
    })
  }

  if (neighborhood) {
    items.push({
      label: neighborhood,
      href: getLocationUrl({ area, city, hood: neighborhood })
    })
  }

  return <Breadcrumbs items={items} home={!embedded} centered={embedded} />
}
