import React from 'react'
import { type Metadata } from 'next'

import Markdown from '@content/privacy-policy'
import { StaticPageTemplate } from '@templates'

const title = 'Privacy Policy'

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
