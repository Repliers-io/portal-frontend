import React from 'react'

import { Stack } from '@mui/material'

import blogConfig from '@configs/blog'

import { type BlogCategory, type Post } from 'services/CMS'

import {
  BlogBreadcrumbs,
  BlogPostContent,
  BlogPostFeaturedImage,
  BlogPostHeader,
  BlogPostNavigation,
  BlogSimilarPosts
} from './components'
import { findSimilarPosts } from './utils'

type BlogPostPageContentProps = {
  post: Post
  nextPost?: Post | null
  previousPost?: Post | null
  allPosts?: Post[]
  path?: BlogCategory[]
}

const { similarPostsCount, includeCategoriesInSimilar } = blogConfig

export const BlogPostPageContent = ({
  post,
  nextPost,
  previousPost,
  allPosts = [],
  path
}: BlogPostPageContentProps) => {
  // Calculate reading time (average 200 words per minute)
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  // Find similar posts
  const excludePosts = blogConfig.excludeNavigationPostsFromSimilar
    ? [nextPost, previousPost].filter(
        (p): p is Post => p !== null && p !== undefined
      )
    : []

  const similarPosts = findSimilarPosts({
    currentPost: post,
    allPosts,
    limit: similarPostsCount,
    excludePosts,
    includeCategories: includeCategoriesInSimilar
  })

  return (
    <Stack spacing={4}>
      <BlogBreadcrumbs path={path} />

      <Stack spacing={4}>
        {/* Header */}
        <BlogPostHeader post={post} readingTime={readingTime} />

        {/* Featured Image */}
        <BlogPostFeaturedImage post={post} />

        {/* Content */}
        <BlogPostContent post={post} />

        {/* Post Navigation */}
        <BlogPostNavigation nextPost={nextPost} previousPost={previousPost} />
      </Stack>

      {/* Similar Posts */}
      <BlogSimilarPosts posts={similarPosts} />

      {/* Comments Section could go here */}
    </Stack>
  )
}
