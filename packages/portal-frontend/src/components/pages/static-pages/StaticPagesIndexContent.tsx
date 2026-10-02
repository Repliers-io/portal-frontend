import React from 'react'

import { Box, Grid, Stack } from '@mui/material'

import cmsRoutingConfig from '@configs/cms'

import { type Page } from 'services/CMS'

import { PageCard } from './components'
import { applyMode } from './utils'

type StaticPagesIndexContentProps = {
  pages: Page[]
  path?: string[]
}

export const StaticPagesIndexContent = ({
  pages
}: StaticPagesIndexContentProps) => {
  const mode = cmsRoutingConfig.foldersIndexMode ?? 'foldersFirst'
  const visiblePages = applyMode(pages, mode)

  return (
    <Stack spacing={4}>
      {/* Pages Grid */}
      <Box bgcolor="background.default">
        {visiblePages.length > 0 && (
          <Grid container spacing={4}>
            {visiblePages.map((page) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={page.id}>
                <PageCard page={page} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  )
}
