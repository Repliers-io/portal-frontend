import React from 'react'
import { type Metadata } from 'next'

import Markdown from '@content/dmca-notice'
import { StaticPageTemplate } from '@templates'

const title = 'DMCA Notice'

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
