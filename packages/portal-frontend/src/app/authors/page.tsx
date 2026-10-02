import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { AuthorsIndexPageContent } from '@pages/blog'

export const metadata: Metadata = {
  ...content.pagesMeta.authors,
  alternates: { canonical: routes.authors }
}

export const revalidate = 86400

const AuthorsPage = async () => {
  if (!features.blog) notFound()

  return <AuthorsIndexPageContent />
}

export default AuthorsPage
