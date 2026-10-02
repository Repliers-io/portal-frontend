import React from 'react'

import { Stack } from '@mui/material'

import routes from '@configs/routes'

import { type BlogTag } from 'services/CMS'
import { capitalize } from 'utils/strings'

import { BlogChip } from './BlogChip'

type TagCloudProps = {
  tags: BlogTag[]
  showCount?: boolean
}

export const TagCloud = ({ tags, showCount = false }: TagCloudProps) => {
  if (!tags.length) return null

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {tags.map((tag) => {
        const displayName = capitalize(tag.name)

        return (
          <BlogChip
            key={tag.slug}
            label={displayName}
            count={showCount ? tag.count : undefined}
            href={`${routes.blog}/tag/${tag.slug}`}
          />
        )
      })}
    </Stack>
  )
}
