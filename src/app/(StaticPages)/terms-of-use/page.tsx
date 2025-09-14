import React from 'react'
import { type Metadata } from 'next'

import Markdown from '@content/terms-of-use'
import { StaticPageTemplate } from '@templates'

const title = 'Terms of Use'

export const metadata: Metadata = {
  title
}

// TODO: Make this page customizable per Config

const AboutPage = () => {
  return (
    <StaticPageTemplate title={title}>
      <Markdown />
    </StaticPageTemplate>
  )
}

export default AboutPage
