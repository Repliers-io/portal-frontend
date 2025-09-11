import React from 'react'
import { type Metadata } from 'next'

import Markdown from '@content/accessibility'
import { StaticPageTemplate } from '@templates'

const title = 'Accessibility Statement'

export const metadata: Metadata = {
  title
}

const AboutPage = () => {
  return (
    <StaticPageTemplate title={title}>
      <Markdown />
    </StaticPageTemplate>
  )
}

export default AboutPage
