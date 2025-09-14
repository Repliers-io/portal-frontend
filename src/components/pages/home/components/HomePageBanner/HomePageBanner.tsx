import React from 'react'

import BannerContainer from './BannerContainer'
import BannerDescription from './BannerDescription'
import BannerImage from './BannerImage'

const HomePageBanner = ({
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
      {children}
    </BannerContainer>
  )
}

export default HomePageBanner
