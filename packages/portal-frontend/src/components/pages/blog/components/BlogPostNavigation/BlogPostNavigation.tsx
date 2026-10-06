import React from 'react'

import { Stack } from '@mui/material'

import { EmptyNavigationCard, NavigationCard } from '.'

type NavigationPost = {
  slug: string
  title: string
  featuredImage?: {
    url: string
    alt?: string
  }
}

type BlogPostNavigationProps = {
  previousPost?: NavigationPost | null
  nextPost?: NavigationPost | null
}

export const BlogPostNavigation = ({
  previousPost,
  nextPost
}: BlogPostNavigationProps) => {
  if (!previousPost && !nextPost) {
    return null
  }

  return (
    <Stack
      width="100%"
      spacing={{ xs: 2, md: 4 }}
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
    >
      {nextPost ? (
        <NavigationCard post={nextPost} direction="next" />
      ) : (
        <EmptyNavigationCard direction="next" />
      )}

      {previousPost ? (
        <NavigationCard post={previousPost} direction="previous" />
      ) : (
        <EmptyNavigationCard direction="previous" />
      )}
    </Stack>
  )
}
