import React from 'react'

import { CardMedia, Link } from '@mui/material'

import { BlogCategoryChip } from '@pages/blog/components'

import { type BlogCategory } from 'services/CMS'

interface ContentCardMediaProps {
  imageUrl: string
  title: string
  linkUrl: string
  category?: BlogCategory
}

export const ContentCardMedia = ({
  imageUrl,
  title,
  linkUrl,
  category
}: ContentCardMediaProps) => {
  return (
    <Link
      href={linkUrl}
      sx={{ display: 'block', flex: 1, width: '100%', position: 'relative' }}
    >
      <CardMedia
        component="img"
        loading="lazy"
        sx={{
          width: '100%',
          aspectRatio: '16/10',
          objectFit: 'cover',
          borderRadius: 1,
          bgcolor: 'grey.300'
        }}
        image={imageUrl}
        alt={title}
      />
      {category && <BlogCategoryChip category={category} />}
    </Link>
  )
}
