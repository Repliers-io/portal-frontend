'use client'

import React from 'react'

import { Avatar, Box, Chip, Link, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

import { type ContentAuthor } from 'services/CMS'

import { formatBlogDate } from '../../../utils'

type BlogPostCardMetaProps = {
  author?: ContentAuthor
  publishedAt?: Date
  tags?: string[]
}

export const BlogPostCardMeta = ({
  author,
  publishedAt,
  tags
}: BlogPostCardMetaProps) => {
  return (
    <Box sx={{ p: 2, pt: 0 }}>
      {/* Author and Date */}
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: '-1px', pt: 2, borderTop: 1, borderColor: 'divider' }}
      >
        {author ? (
          <Link
            href={`${routes.author}/${author.slug}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: 'primary.dark',
              textDecoration: 'none',
              '&:hover .author-name': { textDecoration: 'underline' }
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {author.avatar && (
                <Avatar
                  src={author.avatar}
                  alt=""
                  sx={{ width: 24, height: 24 }}
                />
              )}
              <Typography variant="h6" color="inherit" className="author-name">
                {author.name}
              </Typography>
            </Stack>
          </Link>
        ) : (
          <Box />
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`${routes.blog}/tag/${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Chip
                  label={tag}
                  size="small"
                  variant="outlined"
                  component="a"
                  clickable
                />
              </Link>
            ))}
          </Stack>
        )}

        {publishedAt && (
          <Typography variant="body2" color="text.hint">
            {formatBlogDate(publishedAt, 'postCard')}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
