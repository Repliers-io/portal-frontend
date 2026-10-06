import React from 'react'

import { Chip } from '@mui/material'

import { type BlogCategory } from 'services/CMS'

type BlogCategoryChipProps = {
  category: BlogCategory
}

/**
 * Category chip to display on blog post images
 * Positioned absolutely in the top-right corner
 */
export const BlogCategoryChip = ({ category }: BlogCategoryChipProps) => {
  return (
    <Chip
      label={category.name}
      size="small"
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        height: 'auto',
        zIndex: 3,
        borderRadius: 1,
        bgcolor: 'secondary.main',
        color: 'common.white',
        '& .MuiChip-label': {
          fontSize: 12,
          px: 1.25,
          py: 0.5
        }
      }}
    />
  )
}
