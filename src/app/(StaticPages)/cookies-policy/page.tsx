import { type Metadata } from 'next'

import Markdown from '@content/cookies-policy'
import { StaticPageTemplate } from '@templates'

const title = 'Our Cookies Policy'

export const metadata: Metadata = {
  title
}

const CookiePage = () => {
  return (
    <StaticPageTemplate title={title}>
      <Markdown />
    </StaticPageTemplate>
  )
}

export default CookiePage
