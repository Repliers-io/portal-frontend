import { Container } from '@mui/material'

import blogConfig from '@configs/blog'
import features from '@configs/features'
import { ReviewsCarousel } from '@shared/Carousel'
import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import CmsService, { type WordPressClient } from 'services/CMS'

interface Props {
  title?: string
  subtitle?: string
  bgcolor?: string
}

export const ReviewsWidget = async ({
  title,
  subtitle,
  bgcolor = 'background.paper'
}: Props) => {
  if (!features.blog) return null

  const blogClient = CmsService.getBlogClient() as WordPressClient

  // Fetch reviews from WordPress custom post type
  const reviews = await blogClient.getCustomPosts('review', {
    limit: blogConfig.postsPerPage
  })

  return (
    <WidgetWrapper maxWidth={false} bgcolor={bgcolor}>
      <Container maxWidth="lg">
        <ReviewsCarousel title={title} subtitle={subtitle} reviews={reviews} />
      </Container>
    </WidgetWrapper>
  )
}
