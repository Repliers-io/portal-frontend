import React from 'react'
import Link from 'next/link'

import { Avatar, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'
import { formatBlogDate } from '@pages/blog/utils'

import { type ContentAuthor } from 'services/CMS'

interface ContentCardMetaProps {
  author?: ContentAuthor
  publishedAt?: Date
}

export const ContentCardMeta = ({
  author,
  publishedAt
}: ContentCardMetaProps) => {
  if (!author && !publishedAt) return null

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {author && (
        <Link
          href={`${routes.author}/${author.slug}`}
          style={{ textDecoration: 'none' }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              '&:hover .author-name': {
                textDecoration: 'underline'
              }
            }}
          >
            {author.avatar && (
              <Avatar
                src={author.avatar}
                alt=""
                sx={{ width: 32, height: 32 }}
              />
            )}
            {author.name && (
              <Typography
                variant="h6"
                color="primary.dark"
                className="author-name"
              >
                {author.name}
              </Typography>
            )}
          </Stack>
        </Link>
      )}
      {publishedAt && (
        <Typography variant="body2" color="text.hint">
          {formatBlogDate(publishedAt, 'postCard')}
        </Typography>
      )}
    </Stack>
  )
}
