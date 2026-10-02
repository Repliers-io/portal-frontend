import React from 'react'

import { Box, Typography } from '@mui/material'

import routes from '@configs/routes'

import CmsService from 'services/CMS'

import { ContentCard } from '../components'
import { WidgetWrapper } from '../WidgetWrapper'

export interface PageWidgetProps {
  /**
   * Slug of the page to display
   */
  slug: string
  /**
   * Optional title to display above the page card
   */
  title?: string
  bgcolor?: string
}

/**
 * Server-side widget to display a single static page card
 * Fetches page by slug
 */
export const PageWidget = async ({ slug, title, bgcolor }: PageWidgetProps) => {
  let page = null
  let error = null

  try {
    const client = CmsService.getPagesClient()
    page = await client.getPage(slug)
    if (!page) {
      error = `Page with slug "${slug}" not found`
    }
  } catch (err) {
    console.error('PageWidget::Error fetching page', err)
    error = err instanceof Error ? err.message : 'Failed to fetch page'
  }

  if (error || !page) {
    return (
      <WidgetWrapper maxWidth="lg" bgcolor={bgcolor}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error.dark">
            {error || 'Page not found'}
          </Typography>
        </Box>
      </WidgetWrapper>
    )
  }

  return (
    <WidgetWrapper maxWidth="lg" bgcolor={bgcolor}>
      {title && (
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          {title}
        </Typography>
      )}
      <ContentCard post={page} linkUrl={`${routes.staticPage}/${page.slug}`} />
    </WidgetWrapper>
  )
}
