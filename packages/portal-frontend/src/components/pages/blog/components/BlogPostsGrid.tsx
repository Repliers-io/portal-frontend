'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Grid, Stack, Typography } from '@mui/material'

import blogConfig from '@configs/blog'
import routes from '@configs/routes'

import { type Post } from 'services/CMS'

import { BlogPostCard } from './BlogPostCard/BlogPostCard'
import { BlogPagination } from './BlogPagination'
import { LoadMoreButton } from './LoadMoreButton'

type BlogPostsGridProps = {
  posts: Post[]
  currentPage: number // 0-based
  tag?: string
  category?: string
  emptyMessage?: string
  totalPosts: number
  showCategory?: boolean
  showMeta?: boolean
}

export const BlogPostsGrid = ({
  posts,
  currentPage,
  tag,
  category,
  emptyMessage,
  totalPosts,
  showCategory,
  showMeta = true
}: BlogPostsGridProps) => {
  const t = useTranslations('Blog')
  const [loadedPosts, setLoadedPosts] = useState(posts)
  const [loadedPage, setLoadedPage] = useState(currentPage)

  const classicPagination = blogConfig.paginationType === 'classic'
  const postsPerPage = blogConfig.postsPerPage
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const hasMore = (loadedPage + 1) * postsPerPage < totalPosts

  // Build base URL for pagination
  let baseUrl = routes.blog
  if (tag) baseUrl = `${routes.blog}/tag/${tag}`
  if (category) baseUrl = `${routes.blog}/category/${category}`

  const handleLoadMore = (newPosts: Post[]) => {
    setLoadedPosts((prev) => [...prev, ...newPosts])
    setLoadedPage((prev) => prev + 1)
  }

  return (
    <Stack spacing={4} justifyContent="center">
      <Grid container spacing={4}>
        {loadedPosts.map((post) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
            <BlogPostCard
              post={post}
              showMeta={showMeta}
              showCategory={showCategory}
            />
          </Grid>
        ))}
      </Grid>

      {classicPagination ? (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={baseUrl}
        />
      ) : (
        hasMore && (
          <LoadMoreButton
            tag={tag}
            category={category}
            currentPage={loadedPage}
            postsPerPage={postsPerPage}
            onLoadMore={handleLoadMore}
          />
        )
      )}

      {!loadedPosts.length && (
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ py: 8 }}
        >
          {emptyMessage || t('noBlogPostsAvailable')}
        </Typography>
      )}
    </Stack>
  )
}
