import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { type BlogTag } from 'services/CMS'

import { TagCloud } from './TagCloud'

type BlogTagsBrowserProps = {
  tags: BlogTag[]
}

export const BlogTagsBrowser = ({ tags }: BlogTagsBrowserProps) => {
  const t = useTranslations('Blog')

  if (!tags.length) return null

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('browseByTag')}</Typography>

      <TagCloud tags={tags} showCount />
    </Stack>
  )
}
