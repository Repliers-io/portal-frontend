import React from 'react'

import { Box, Typography } from '@mui/material'

import features from '@configs/features'
import routes from '@configs/routes'

import CmsService from 'services/CMS'

import { ContentCard } from '../components'
import { WidgetWrapper } from '../WidgetWrapper'

export interface BlogPostWidgetProps {
  /**
   * Slug of the specific blog post to display
   * If provided, takes precedence over index
   */
  slug?: string
  /**
   * Index from the end of the posts list (0 = latest post, 1 = second latest, etc.)
   * Only used if slug is not provided
   * @default 0
   */
  index?: number
  /**
   * Filter posts by category slug
   * Only used when fetching by index
   */
  category?: string
  /**
   * Filter posts by tag slug
   * Only used when fetching by index
   */
  tag?: string
  /**
   * Optional title to display above the post card
   */
  title?: string
  /**
   * Show category chip on the post image
   * @default false
   */
  showCategory?: boolean
  bgcolor?: string
}

/**
 * Server-side widget to display a single blog post card
 * Can fetch by slug or by index from the end of posts list
 * Supports filtering by category or tag when using index
 */
export const BlogPostWidget = async ({
  slug,
  index = 0,
  category,
  tag,
  title,
  showCategory = false,
  bgcolor
}: BlogPostWidgetProps) => {
  if (!features.blog) return null

  let post = null
  let error = null

  try {
    const client = CmsService.getBlogClient()

    if (slug) {
      // Fetch by slug
      post = await client.getPost(slug)
      if (!post) {
        error = `Post with slug "${slug}" not found`
      }
    } else {
      // Fetch by index from end with optional category/tag filtering
      const posts = await client.getPosts({
        limit: index + 1,
        category,
        tag
      })
      if (posts && posts.length > index) {
        post = posts[index]
      } else {
        const filterText = category
          ? ` in category "${category}"`
          : tag
            ? ` with tag "${tag}"`
            : ''
        error = `Post at index ${index}${filterText} not found`
      }
    }
  } catch (err) {
    console.error('BlogPostWidget::Error fetching post', err)
    error = err instanceof Error ? err.message : 'Failed to fetch post'
  }

  if (error || !post) {
    return (
      <WidgetWrapper maxWidth="lg" bgcolor={bgcolor}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error.dark">
            {error || 'Post not found'}
          </Typography>
        </Box>
      </WidgetWrapper>
    )
  }

  return (
    <WidgetWrapper maxWidth="lg" bgcolor={bgcolor}>
      {title && (
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          {title}
        </Typography>
      )}
      <ContentCard
        post={post}
        linkUrl={`${routes.blog}/${post.slug}`}
        showCategory={showCategory}
      />
    </WidgetWrapper>
  )
}
