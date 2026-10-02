'use client'

import { useTranslations } from 'next-intl'

import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'

import { getLocationBuildingsUrl } from '../utils'

export const LocBuildingsBreadcrumbs = () => {
  const { area, city, hood } = useLocationPage()
  const t = useTranslations('Breadcrumbs')

  const items: BreadcrumbItem[] = [
    { label: t('buildings'), href: routes.condos }
  ]

  if (area && locationConfig.showAreas) {
    items.push({
      label: capitalize(area),
      href: getLocationBuildingsUrl({ area })
    })
  }

  if (city) {
    items.push({
      label: capitalize(city),
      href: getLocationBuildingsUrl({ area, city })
    })
  }

  if (hood) {
    items.push({
      label: capitalize(hood),
      href: getLocationBuildingsUrl({ area, city, hood })
    })
  }

  return <Breadcrumbs items={items} home />
}
