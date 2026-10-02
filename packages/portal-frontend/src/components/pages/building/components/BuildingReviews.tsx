'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Button, Grid } from '@mui/material'

import { BlogPostCard } from '@pages/blog/components'

import { useBuilding } from 'providers/BuildingProvider'

import { buildingItemsInitialLimit } from '../constants'

import { BuildingSectionContainer } from './BuildingSectionContainer'

export const BuildingReviews = () => {
  const t = useTranslations('Building')
  const { reviews } = useBuilding()
  const [showAll, setShowAll] = useState(false)

  if (!reviews.posts.length) {
    return null
  }

  const postsToShow = showAll
    ? reviews.posts
    : reviews.posts.slice(0, buildingItemsInitialLimit)
  const hasMore = reviews.posts.length > buildingItemsInitialLimit

  return (
    <BuildingSectionContainer id="reviews" title={t('reviewsTitle')}>
      <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
        {postsToShow.map((post) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
            <BlogPostCard post={post} showCategory={false} showMeta={false} />
          </Grid>
        ))}
      </Grid>
      {hasMore && !showAll && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button size="small" variant="text" onClick={() => setShowAll(true)}>
            {t('showMore')}
          </Button>
        </Box>
      )}
    </BuildingSectionContainer>
  )
}
