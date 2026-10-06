import React from 'react'
import { useTranslations } from 'next-intl'

import { Avatar, Link, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

import { type Post } from 'services/CMS'

import { formatBlogDate } from '../utils'

import { TagCloud } from '.'

type BlogPostHeaderProps = {
  post: Post
  readingTime: number
}

export const BlogPostHeader = ({ post, readingTime }: BlogPostHeaderProps) => {
  const t = useTranslations('Blog')

  return (
    <Stack spacing={2} py={1}>
      <Typography variant="h1" fontSize={56}>
        {post.title}
      </Typography>

      {/* Metadata */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={6} alignItems="center">
          {post.author && (
            <Link
              href={`${routes.author}/${post.author.slug}`}
              sx={{
                color: 'primary.dark',
                textDecoration: 'none',
                '&:hover .author-name': { textDecoration: 'underline' }
              }}
            >
              <Stack
                spacing={1.5}
                direction="row"
                alignItems="center"
                sx={{
                  '&:hover .author-name': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {post.author.avatar && (
                  <Avatar
                    src={post.author.avatar}
                    alt=""
                    sx={{ width: 32, height: 32 }}
                  />
                )}
                <Typography
                  variant="h6"
                  color="inherit"
                  className="author-name"
                >
                  {post.author.name}
                </Typography>
              </Stack>
            </Link>
          )}
          {post.publishedAt && (
            <Typography variant="body2" color="text.hint">
              {formatBlogDate(post.publishedAt, 'postHeader')}
            </Typography>
          )}
          <Typography variant="body2" color="text.hint">
            {readingTime} {t('minRead')}
          </Typography>
        </Stack>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && <TagCloud tags={post.tags} />}
      </Stack>
    </Stack>
  )
}
