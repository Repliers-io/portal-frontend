import React from 'react'

import { Typography } from '@mui/material'

interface ContentCardExcerptProps {
  excerpt?: string
}

export const ContentCardExcerpt = ({ excerpt }: ContentCardExcerptProps) => {
  if (!excerpt) return null

  return (
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{
        lineHeight: 1.7,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 6,
        WebkitBoxOrient: 'vertical'
      }}
    >
      {excerpt}
    </Typography>
  )
}
