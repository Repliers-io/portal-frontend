import React from 'react'

import { Box, CardMedia, Typography } from '@mui/material'

import { type BlogCategory, type ContentImage } from 'services/CMS'

import { BlogCategoryChip } from '../..'

type BlogPostCardImageProps = {
  featuredImage?: ContentImage
  title: string
  category?: BlogCategory
}

export const BlogPostCardImage = ({
  featuredImage,
  title,
  category
}: BlogPostCardImageProps) => {
  return (
    <Box
      sx={{
        height: 200,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        bgcolor: 'grey.100',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography
        variant="h1"
        sx={{
          mt: 6,
          lineHeight: 1,
          fontSize: '6rem',
          color: 'grey.500',
          fontFamily: 'serif',
          position: 'absolute',
          zIndex: 1
        }}
      >
        &rdquo;
      </Typography>

      {featuredImage && (
        <CardMedia
          height="200"
          component="img"
          image={featuredImage.url}
          alt={featuredImage.alt || title}
          sx={{
            inset: 0,
            zIndex: 1,
            objectFit: 'cover',
            position: 'absolute',
            display: 'block'
          }}
        />
      )}

      {category && <BlogCategoryChip category={category} />}
    </Box>
  )
}
