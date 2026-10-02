import locationConfig from '@configs/location'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { useLocationPage } from 'providers/LocationProvider'
import { getLocationUrl } from 'utils/urls'

export const LocationBreadcrumbs = ({ home = true }: { home?: boolean }) => {
  const { area, areaLabel, city, hood } = useLocationPage()
  const items: BreadcrumbItem[] = [
    { label: locationConfig.state, href: getLocationUrl() }
  ]

  if (area && locationConfig.showAreas)
    items.push({ label: areaLabel ?? area, href: getLocationUrl({ area }) })
  if (city) items.push({ label: city, href: getLocationUrl({ area, city }) })
  if (hood)
    items.push({ label: hood, href: getLocationUrl({ area, city, hood }) })

  if (!home && items.length <= 1) return null

  // Last item is current page — no link
  items[items.length - 1] = { label: items[items.length - 1].label }

  return <Breadcrumbs items={items} home={home} />
}
