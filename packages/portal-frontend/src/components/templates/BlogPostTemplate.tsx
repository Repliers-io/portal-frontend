import React from 'react'

import { StaticPageTemplate } from './StaticPageTemplate'

export const BlogPostTemplate = ({
  title = '',
  children
}: {
  title?: string
  children: React.ReactNode
}) => {
  return (
    <StaticPageTemplate maxWidth="md" title={title}>
      {children}
    </StaticPageTemplate>
  )
}
