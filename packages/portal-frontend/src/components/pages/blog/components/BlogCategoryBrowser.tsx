import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

import { type BlogCategory } from 'services/CMS'

import { BlogChip } from './BlogChip'

type BlogCategoryBrowserProps = {
  categories: BlogCategory[]
  showEmpty?: boolean
  showCount?: boolean
}

// Build full slug path from child to root
const buildSlugPath = (
  category: BlogCategory,
  allCategories: BlogCategory[]
): string => {
  const path: string[] = [category.slug]
  let current = category

  while (current.parentSlug) {
    const parent = allCategories.find((cat) => cat.slug === current.parentSlug)
    if (!parent) break
    path.unshift(parent.slug)
    current = parent
  }

  return path.join('/')
}

export const BlogCategoryBrowser = ({
  categories,
  showEmpty = false,
  showCount = true
}: BlogCategoryBrowserProps) => {
  const t = useTranslations('Blog')

  // Filter out empty categories unless showEmpty is true
  const filteredCategories = showEmpty
    ? categories
    : categories.filter((cat) => (cat.count ?? 0) > 0)

  if (!filteredCategories.length) return null

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('browseByCategory')}</Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {filteredCategories.map((category) => (
          <BlogChip
            key={category.id}
            label={category.name}
            count={showCount ? category.count : undefined}
            href={`${routes.blog}/category/${buildSlugPath(category, categories)}`}
          />
        ))}
      </Stack>
    </Stack>
  )
}
