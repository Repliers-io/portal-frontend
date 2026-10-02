import React from 'react'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Stack } from '@mui/material'

// import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'
import { AuthorsWidget } from '@shared/CmsWidgets'

export const AuthorsIndexPageContent = async () => {
  const t = await getTranslations('Blog')

  const breadcrumbItems: BreadcrumbItem[] = [
    // {
    //   label: 'Blog',
    //   href: routes.blog
    // },
    {
      label: t('authors')
    }
  ]

  return (
    <PageTemplate>
      <Box sx={{ pt: 2, pb: 6 }}>
        <Stack spacing={4}>
          <Container maxWidth="lg" sx={{ px: 0 }}>
            <Breadcrumbs home items={breadcrumbItems} />
          </Container>

          <AuthorsWidget title={t('meetOurTeam')} />
        </Stack>
      </Box>
    </PageTemplate>
  )
}
