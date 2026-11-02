import React from 'react'

import BannerContainer from './BannerContainer'
import { BannerDescription } from './BannerDescription'
import { BannerDocumentation } from './BannerDocumentation'
import BannerImage from './BannerImage'

export const HomePageBanner = ({
  title = '',
  subtitle = '',
  children
}: {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}) => {
  return (
    <BannerContainer>
      <BannerImage />
      <BannerDescription title={title} subtitle={subtitle} />
      <BannerDocumentation />
      {children}
    </BannerContainer>
  )
}
