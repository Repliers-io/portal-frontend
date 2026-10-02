import React from 'react'

import { Stack } from '@mui/material'

import { type Post } from 'services/CMS'

import { BlogBreadcrumbs, BlogPostsGrid } from './components'

type BlogTagPageContentProps = {
  tag: string
  posts: Post[]
  currentPage: number // 0-based
  totalPosts: number
}

export const BlogTagPageContent = async ({
  tag,
  posts: initialPosts,
  currentPage: initialPage,
  totalPosts
}: BlogTagPageContentProps) => {
  return (
    <Stack spacing={4}>
      {/* Tag Breadcrumbs */}
      <BlogBreadcrumbs tag={tag} />

      {/* Posts Grid */}
      <BlogPostsGrid
        tag={tag}
        posts={initialPosts}
        currentPage={initialPage}
        totalPosts={totalPosts}
        showCategory={true}
      />
    </Stack>
  )
}
