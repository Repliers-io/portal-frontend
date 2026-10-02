import React from 'react'
import { useTranslations } from 'next-intl'

import { Divider, Grid, Stack, Typography } from '@mui/material'

import { type Post } from 'services/CMS'

import { BlogPostCard } from './BlogPostCard/BlogPostCard'

type BlogSimilarPostsProps = {
  posts: Post[]
}

export const BlogSimilarPosts = ({ posts }: BlogSimilarPostsProps) => {
  const t = useTranslations('Blog')

  if (!posts.length) return null

  return (
    <Stack spacing={4}>
      <Divider />

      <Typography variant="h2">{t('moreLikeThis')}</Typography>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {posts.map((post) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
            <BlogPostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
