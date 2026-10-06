import React from 'react'

import { Stack } from '@mui/material'

import { type BlogCategory, type Post } from 'services/CMS'

import { BlogBreadcrumbs, BlogPostsGrid } from './components'

type BlogCategoryPageContentProps = {
  category: string
  categoryPath?: BlogCategory[]
  posts: Post[]
  currentPage: number // 0-based
  totalPosts: number
}

export const BlogCategoryPageContent = async ({
  category,
  categoryPath,
  posts: initialPosts,
  currentPage: initialPage,
  totalPosts
}: BlogCategoryPageContentProps) => {
  return (
    <Stack spacing={4}>
      {/* Category Breadcrumbs */}
      <BlogBreadcrumbs category={category} path={categoryPath} />

      {/* Posts Grid */}
      <BlogPostsGrid
        category={category}
        posts={initialPosts}
        currentPage={initialPage}
        totalPosts={totalPosts}
        showCategory={false}
      />
    </Stack>
  )
}
