import React from 'react'

import { Box } from '@mui/material'

import { type Page, type Post } from 'services/CMS'

type BlogPostFeaturedImageProps = {
  post: Post | Page
}

export const BlogPostFeaturedImage = ({ post }: BlogPostFeaturedImageProps) => {
  if (!post.featuredImage) return null

  return (
    <Box
      component="img"
      src={post.featuredImage.url}
      alt={post.featuredImage.alt || post.title}
      sx={{
        width: '100%',
        height: 'auto',
        maxHeight: 500,
        objectFit: 'cover',
        borderRadius: 1
      }}
    />
  )
}
