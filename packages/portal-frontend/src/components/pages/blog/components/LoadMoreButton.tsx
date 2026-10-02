'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import queryString from 'query-string'

import { Button, CircularProgress } from '@mui/material'

import { type Post } from 'services/CMS'

type LoadMoreButtonProps = {
  tag?: string
  category?: string
  currentPage: number
  postsPerPage: number
  onLoadMore: (posts: Post[]) => void
}

export const LoadMoreButton = ({
  tag,
  category,
  currentPage,
  postsPerPage,
  onLoadMore
}: LoadMoreButtonProps) => {
  const t = useTranslations('Blog')
  const [loading, setLoading] = useState(false)

  const handleLoadMore = async () => {
    setLoading(true)

    try {
      const params = queryString.stringify(
        {
          limit: postsPerPage,
          offset: (currentPage + 1) * postsPerPage,
          ...(tag && { tag }),
          ...(category && { category })
        },
        { skipNull: true, skipEmptyString: true }
      )

      const response = await fetch(`/api/blog/posts?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      onLoadMore(data.posts)
    } catch (error) {
      console.error('Failed to load more posts', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="large"
      variant="outlined"
      onClick={handleLoadMore}
      disabled={loading}
      sx={{ minWidth: 160, height: 48, alignSelf: 'center' }}
    >
      {loading ? <CircularProgress size={24} /> : t('loadMore')}
    </Button>
  )
}
