import React from 'react'
import { type Metadata } from 'next'

import content from '@configs/content'
import { PageTemplate } from '@templates'
import HomePageContent from '@pages/home'

export const metadata: Metadata = {
  title: content.pagesMeta.home.title ?? undefined,
  description: content.pagesMeta.home.description ?? undefined,
  openGraph: {
    type: 'website',
    title: content.pagesMeta.home.title ?? undefined,
    description: content.pagesMeta.home.description ?? undefined,
    siteName: content.siteName
  }
}

export const revalidate = 3600

// rootPage feature flag routing is handled at the Next.js routing layer via generated rewrites.
// When rootPage === 'estimate', next.config.js rewrites / → /estimate, so the estimate page
// component handles its own metadata and rendering natively — no branching needed here.

const HomePage = () => (
  <PageTemplate>
    <HomePageContent />
  </PageTemplate>
)

export default HomePage
