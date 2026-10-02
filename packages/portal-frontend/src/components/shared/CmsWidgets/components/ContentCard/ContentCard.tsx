import { Paper, Stack } from '@mui/material'

import { type Page, type Post } from 'services/CMS'

import {
  ContentCardAction,
  ContentCardExcerpt,
  ContentCardMedia,
  ContentCardMeta,
  ContentCardTitle
} from './components'

interface ContentCardProps {
  post: Post | Page
  linkUrl: string
  showCategory?: boolean
}

/**
 * Base horizontal content card component
 * Used by BlogPostWidget and PageWidget.
 * Default tenants render it flat — no shadow, no clipping. urbn keeps the
 * boxed/clipped look via _urbn/ContentCard.tsx.
 */
export const ContentCard = ({
  post,
  linkUrl,
  showCategory = false
}: ContentCardProps) => {
  const { title, excerpt, author, publishedAt, featuredImage } = post
  const imageUrl = featuredImage?.url || ''
  const category =
    showCategory && 'categories' in post ? post.categories?.[0] : undefined

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        overflow: 'visible', // override the global MuiPaper overflow: hidden
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        backgroundColor: 'transparent' // Remove default Paper background
      }}
    >
      <Stack
        alignItems="center"
        spacing={{ xs: 4, md: 8 }}
        direction={{ xs: 'column', md: 'row' }}
      >
        {imageUrl && (
          <ContentCardMedia
            imageUrl={imageUrl}
            title={title}
            linkUrl={linkUrl}
            category={category}
          />
        )}

        <Stack spacing={2} sx={{ flex: 1 }}>
          <ContentCardTitle title={title} linkUrl={linkUrl} />
          <ContentCardMeta author={author} publishedAt={publishedAt} />
          <ContentCardExcerpt excerpt={excerpt} />
          <ContentCardAction linkUrl={linkUrl} />
        </Stack>
      </Stack>
    </Paper>
  )
}
