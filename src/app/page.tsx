import React from 'react'
import type { Metadata } from 'next'

import { PageTemplate } from '@templates'
import HomePageContent from '@pages/home'

import EstimatePage, {
  generateMetadata as generateEstimateMetadata
} from 'app/(Estimates)/estimate/[[...slugs]]/page'

import { fetchFeatures } from 'utils/features'

// NOTE: Dynamically generate metadata for the Estimate Landing Page based on feature flags.
// When manually setting rootPage with feature flags for the estimate page,
// Next.js does not recognize EstimatePage as a page component and skips page-level metadata configuration.
// To prevent this, metadata must be generated dynamically using feature flags.
export const generateMetadata = async (props: any): Promise<Metadata> => {
  const features = await fetchFeatures()

  if (features.rootPage === 'estimate') {
    // landing page metadata
    return await generateEstimateMetadata(props)
  }
  // other pages will be handled inside layout.tsx
  return {}
}

const HomePage = async (props: any) => {
  const features = await fetchFeatures()

  if (features.rootPage === 'estimate')
    return await (<EstimatePage {...props} />)

  return (
    <PageTemplate>
      <HomePageContent />
    </PageTemplate>
  )
}

export default HomePage
