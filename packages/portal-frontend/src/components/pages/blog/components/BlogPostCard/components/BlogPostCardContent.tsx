'use client'

import React, { useEffect, useRef, useState } from 'react'

import { CardContent, Typography } from '@mui/material'

type BlogPostCardContentProps = {
  title: string
  excerpt?: string
}

export const BlogPostCardContent = ({
  title,
  excerpt
}: BlogPostCardContentProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleLines, setTitleLines] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && titleRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(titleRef.current).lineHeight
      )
      const height = titleRef.current.offsetHeight
      const lines = Math.round(height / lineHeight)
      setTitleLines(Math.min(lines, 3))
    }
  }, [mounted, title])

  // Max 5 lines total for title + excerpt
  // Title max 3 lines, so excerpt gets remaining lines
  const maxExcerptLines = Math.max(1, 5 - titleLines)

  return (
    <CardContent sx={{ flexGrow: 1, p: 2 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mb: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          ...(!mounted && {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          })
        }}
        ref={titleRef}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {excerpt && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: maxExcerptLines,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {excerpt.replace(/<[^>]*>/g, '')}
        </Typography>
      )}
    </CardContent>
  )
}
