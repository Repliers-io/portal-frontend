import { useTranslations } from 'next-intl'

import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { type BlogCategory } from 'services/CMS'
import { capitalize } from 'utils/strings'

type BlogBreadcrumbsProps = {
  path?: BlogCategory[]
  tag?: string
  category?: string
}

export const BlogBreadcrumbs = ({
  path,
  tag,
  category
}: BlogBreadcrumbsProps) => {
  const t = useTranslations('Breadcrumbs')

  if (!path && !tag && !category) return null

  const items: BreadcrumbItem[] = [
    {
      label: t('blog'),
      href: routes.blog
    }
  ]

  // Handle category path (for posts and category pages)
  if (path && path.length > 0) {
    path.forEach((cat, index) => {
      const pathStr = path
        .slice(0, index + 1)
        .map((c) => c.slug)
        .join('/')

      items.push({
        label: cat.name,
        href: `${routes.blog}/category/${pathStr}`
      })
    })
  }
  // Handle tag
  else if (tag) {
    const tagLabel = capitalize(decodeURIComponent(tag).replace(/-/g, ' '))
    items.push({
      label: tagLabel
    })
  }

  return <Breadcrumbs items={items} home />
}
