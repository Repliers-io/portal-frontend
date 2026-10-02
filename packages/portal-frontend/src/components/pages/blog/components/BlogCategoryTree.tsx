'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Link, Stack, Typography } from '@mui/material'

import { ChevronRightIcon, ExpandMoreIcon } from '@configs/icons'
import routes from '@configs/routes'

import { type BlogCategory } from 'services/CMS'

type BlogCategoryTreeProps = {
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

// Build tree structure from flat categories
const buildTree = (categories: BlogCategory[]): BlogCategory[] => {
  // Find root categories (no parent)
  const roots = categories.filter((cat) => !cat.parentSlug)

  // Recursively attach children
  const attachChildren = (
    parent: BlogCategory
  ): BlogCategory & { children?: BlogCategory[] } => {
    const children = categories
      .filter((cat) => cat.parentSlug === parent.slug)
      .map(attachChildren)

    return children.length > 0 ? { ...parent, children } : parent
  }

  return roots.map(attachChildren)
}

// Recursive tree node component
const CategoryTreeNode = ({
  category,
  allCategories,
  level = 0,
  showCount
}: {
  category: BlogCategory & { children?: BlogCategory[] }
  allCategories: BlogCategory[]
  level?: number
  showCount: boolean
}) => {
  const hasChildren = category.children && category.children.length > 0
  const [expanded, setExpanded] = useState(false)

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: level * 3
        }}
      >
        {hasChildren ? (
          <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: 0.5,
              minWidth: 24
            }}
          >
            {expanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </Box>
        ) : (
          <Box sx={{ minWidth: 24 }} />
        )}

        <Link
          href={`${routes.blog}/category/${buildSlugPath(category, allCategories)}`}
          underline="none"
          color="inherit"
          sx={{
            py: 0.75,
            px: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 4,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          <Typography variant="body2">{category.name}</Typography>
          {showCount && category.count !== undefined && (
            <Box
              component="span"
              sx={{
                mr: -0.25,
                px: 0.5,
                height: 20,
                minWidth: 20,
                borderRadius: '10px',
                alignItems: 'center',
                display: 'inline-flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                bgcolor: 'common.white',
                transition: 'background-color 0.2s',
                'a:hover &': {
                  bgcolor: 'background.default'
                }
              }}
            >
              <Typography variant="caption" color="text.hint">
                {category.count}
              </Typography>
            </Box>
          )}
        </Link>
      </Box>

      {hasChildren && expanded && (
        <Stack spacing={0}>
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              showCount={showCount}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export const BlogCategoryTree = ({
  categories,
  showEmpty = false,
  showCount = true
}: BlogCategoryTreeProps) => {
  const t = useTranslations('Blog')

  // Filter out empty categories unless showEmpty is true
  const filteredCategories = showEmpty
    ? categories
    : categories.filter((cat) => (cat.count ?? 0) > 0)

  if (!filteredCategories.length) return null

  const tree = buildTree(filteredCategories)

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t('browseByCategory')}</Typography>

      <Box>
        {tree.map((rootCategory) => (
          <CategoryTreeNode
            key={rootCategory.id}
            category={rootCategory}
            allCategories={categories}
            showCount={showCount}
          />
        ))}
      </Box>
    </Stack>
  )
}
