import React from 'react'

import { Container } from '@mui/material'

import type { PageLayout } from 'services/CMS/types'

import { HeaderBanner } from './components'
import { PageTemplate } from '.'

type StaticPageTemplateProps = {
  title?: string
  maxWidth?: 'md' | 'lg'
  children: React.ReactNode
  layout?: PageLayout
}

export const StaticPageTemplate = ({
  title = '',
  maxWidth = 'md',
  children,
  layout = 'default'
}: StaticPageTemplateProps) => {
  // The banner exists to hold the page title; skip it when there's none
  // (blog posts pass no title — they render it lower, in BlogPostHeader).
  const showBanner = layout !== 'minimal' && Boolean(title)
  const showPadding = layout === 'default'

  return (
    <PageTemplate bgcolor="background.default">
      {showBanner && <HeaderBanner>{title}</HeaderBanner>}
      <Container sx={{ py: showPadding ? 4 : 0, maxWidth }}>
        {children}
      </Container>
    </PageTemplate>
  )
}
