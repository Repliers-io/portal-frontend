'use client'

import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { capitalize } from 'utils/strings'

type StaticPageBreadcrumbsProps = {
  path: string[]
}

export const StaticPageBreadcrumbs = ({
  path = []
}: StaticPageBreadcrumbsProps) => {
  if (!path || path.length <= 1) return null

  const items: BreadcrumbItem[] = []

  // Add parent segments as links
  path.slice(0, -1).forEach((segment, index) => {
    const subPath = path.slice(0, index + 1).join('/')
    const displayName = capitalize(segment.replace(/-/g, ' '))

    items.push({
      label: displayName,
      href: `${routes.staticPage}/${subPath}`
    })
  })

  // Add current page without link
  const title = capitalize((path.at(-1) || '').replace(/-/g, ' '))
  items.push({
    label: title
  })

  return <Breadcrumbs items={items} home />
}
