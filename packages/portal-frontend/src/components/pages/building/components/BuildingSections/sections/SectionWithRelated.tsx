'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Button, Grid, Stack, Typography } from '@mui/material'

import { CmsBuildingCard } from '@pages/buildings/components'
import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { buildingItemsInitialLimit } from '../../../constants'

interface SectionWithRelatedProps {
  heading?: string
  content?: string
  relatedData?: any[]
}

export const SectionWithRelated = ({
  heading,
  content,
  relatedData = []
}: SectionWithRelatedProps) => {
  const t = useTranslations('Building')
  const [showAll, setShowAll] = useState(false)

  if (!relatedData.length) return null

  const itemsToShow = showAll
    ? relatedData
    : relatedData.slice(0, buildingItemsInitialLimit)
  const hasMore = relatedData.length > buildingItemsInitialLimit

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        {heading && <Typography variant="h3">{heading}</Typography>}

        {content && <CmsContentRenderer content={content} />}
      </Stack>

      <Grid container spacing={4}>
        {itemsToShow.map((building) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={building.id}>
            <CmsBuildingCard building={building} />
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
    </Stack>
  )
}
