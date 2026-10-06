import React from 'react'

import { CardMedia, Link, Paper, Stack, Typography } from '@mui/material'

import { formatBlogDate } from '@pages/blog/utils'
import {
  ContentCardAction,
  ContentCardTitle
} from '@shared/CmsWidgets/components/ContentCard/components'

import { type Post } from 'services/CMS'

interface NewsCardProps {
  post: Post
  linkUrl: string
}

export const NewsCard = ({ post, linkUrl }: NewsCardProps) => {
  const { title, excerpt, publishedAt, featuredImage } = post
  const imageUrl = featuredImage?.url || ''

  return (
    <Paper
      sx={{
        display: 'flex',
        overflow: 'hidden',
        flexDirection: { xs: 'column', md: 'row' },
        backgroundColor: 'transparent'
      }}
    >
      <Stack
        alignItems="flex-start"
        spacing={{ xs: 2, sm: 4 }}
        direction={{ xs: 'column', sm: 'row' }}
      >
        {imageUrl && (
          <Link
            href={linkUrl}
            sx={{
              flexShrink: 0,
              display: 'block',
              position: 'relative',
              width: { xs: '100%', sm: 389 }
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              sx={{
                width: '100%',
                objectFit: 'contain',
                objectPosition: 'top',
                borderRadius: 1
              }}
              image={imageUrl}
              alt={title}
            />
          </Link>
        )}

        <Stack sx={{ flex: 1 }}>
          <ContentCardTitle title={title} linkUrl={linkUrl} />
          {excerpt && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, lineHeight: 1.7 }}
            >
              {excerpt}
            </Typography>
          )}
          {publishedAt && (
            <Typography variant="body2" color="text.hint" mt={1}>
              {formatBlogDate(publishedAt, 'postCard')}
            </Typography>
          )}
          <ContentCardAction linkUrl={linkUrl} />
        </Stack>
      </Stack>
    </Paper>
  )
}
