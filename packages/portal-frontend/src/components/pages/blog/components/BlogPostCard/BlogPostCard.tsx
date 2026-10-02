import React from 'react'

import { Card, CardActionArea } from '@mui/material'

import routes from '@configs/routes'

import { type Post } from 'services/CMS'

import {
  BlogPostCardContent,
  BlogPostCardImage,
  BlogPostCardMeta
} from './components'

type BlogPostCardProps = {
  post: Post
  showCategory?: boolean
  showMeta?: boolean
}

export const BlogPostCard = ({
  post,
  showCategory = false,
  showMeta = true
}: BlogPostCardProps) => {
  const {
    featuredImage,
    title,
    excerpt,
    author,
    publishedAt,
    slug,
    categories
  } = post

  return (
    <Card
      sx={{
        height: '100%',
        maxHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 0,
        position: 'relative',
        overflow: 'hidden',

        '&:after': {
          zIndex: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }
      }}
    >
      <CardActionArea
        href={`${routes.blog}/${slug}`}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          position: 'relative',
          '& .MuiCardActionArea-focusHighlight, & .MuiTouchRipple-root': {
            zIndex: 10
          }
        }}
      >
        <BlogPostCardImage
          featuredImage={featuredImage}
          title={title}
          category={showCategory ? categories?.[0] : undefined}
        />
        <BlogPostCardContent title={title} excerpt={excerpt} />
      </CardActionArea>
      {/* Meta lives outside CardActionArea: its author link is an <a>, and nesting it
          inside the card-wide <a> is invalid HTML — the browser un-nests it on parse,
          causing a hydration mismatch and a visible layout jump. */}
      {showMeta && (
        <BlogPostCardMeta author={author} publishedAt={publishedAt} />
      )}
    </Card>
  )
}
