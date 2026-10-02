import React from 'react'
import { useTranslations } from 'next-intl'

import { type PropertyClass } from '@configs/filters'
import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { capitalize } from 'utils/strings'

type DashboardBreadcrumbsProps = {
  city: string
  citySlug: string
  propertyClass: PropertyClass
}

export const DashboardBreadcrumbs = ({
  city,
  citySlug,
  propertyClass
}: DashboardBreadcrumbsProps) => {
  const t = useTranslations()

  const items: BreadcrumbItem[] = [
    {
      label: t('Menu.dashboard'),
      href: routes.dashboard
    },
    {
      label: capitalize(city),
      href: `${routes.dashboard}/${citySlug}`
    }
  ]

  if (propertyClass !== 'all') {
    items.push({
      label: `${capitalize(propertyClass)} Insights`
    })
  } else {
    items[items.length - 1] = { label: capitalize(city) }
  }

  return <Breadcrumbs items={items} home />
}
