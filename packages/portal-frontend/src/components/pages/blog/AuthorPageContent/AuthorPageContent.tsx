import React from 'react'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Divider, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'
import { ReviewsCarousel } from '@shared/Carousel'
import { ContactWidget, GridWidget, MapGridWidget } from '@shared/CmsWidgets'

import { type ContentAuthor, type Post } from 'services/CMS'
import { soldDateDesc } from 'utils/listings'

import { AuthorHeader, NewsCard } from './components'
import { buildAgentSoldQueries } from './utils'

type AuthorPageContentProps = {
  author: ContentAuthor
  reviews?: Post[]
  news?: Post[]
}

export const AuthorPageContent = async ({
  author,
  reviews = [],
  news = []
}: AuthorPageContentProps) => {
  const { agentId, name } = author
  const firstName = name?.split(' ')[0]
  const queries = buildAgentSoldQueries(agentId)
  const t = await getTranslations('Blog')

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'About',
      href: routes.about
    },
    {
      label: name
    }
  ]

  return (
    <PageTemplate>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Breadcrumbs home items={breadcrumbItems} />
          <Stack spacing={4}>
            {/* Author Header */}
            <AuthorHeader author={author} />

            <Divider sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Stack
              spacing={4}
              divider={
                <Divider sx={{ display: { xs: 'none', sm: 'block' } }} />
              }
              sx={{
                pb: 4,
                '&:not(:has(*))': { display: 'none' },
                '& > [data-empty] + hr': { display: 'none !important' },
                '& > hr:has(+ [data-empty])': { display: 'none !important' }
              }}
            >
              {agentId && (
                <MapGridWidget
                  title={t('homesSelling', { name: firstName })}
                  zoomButtons
                  styleButtons
                  layoutSwitch
                  maxColumns={4}
                  mobileHeight={400}
                  listings={{
                    sortBy: 'createdOnDesc',
                    listingStatus: 'active',
                    agentId
                  }}
                />
              )}
              {agentId && (
                <GridWidget
                  title={t('soldBy', { name: firstName })}
                  pagination={true}
                  maxColumns={4}
                  listings={{
                    resultsPerPage: 8,
                    sortBy: soldDateDesc,
                    listingStatus: 'sold',
                    ...(queries ? { queries } : { agentId })
                  }}
                />
              )}
              {news.length > 0 && (
                <Stack spacing={4}>
                  <Typography variant="h3">{t('inTheNews')}</Typography>
                  <Stack spacing={4} divider={<Divider sx={{ my: 0 }} />}>
                    {news.map((post) => (
                      <NewsCard
                        key={post.id}
                        post={post}
                        linkUrl={post.acf?.source_url as string}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}

              {reviews.length > 0 && (
                <ReviewsCarousel title={t('recentReviews')} reviews={reviews} />
              )}
            </Stack>

            <Box sx={{ mt: -4 }}>
              <ContactWidget title={t('contactMe', { name: firstName })} />
            </Box>
          </Stack>
        </Stack>
      </Container>
    </PageTemplate>
  )
}
