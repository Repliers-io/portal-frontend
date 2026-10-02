import React from 'react'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Stack, Typography } from '@mui/material'
import type { Breakpoint } from '@mui/system'

import blogConfig from '@configs/blog'
import features from '@configs/features'

import CmsService from 'services/CMS'
import { type ContentAuthor } from 'services/CMS/types'

import { WidgetHtmlText } from '../../components'

import AuthorCard from './AuthorCard'

export interface AuthorsWidgetProps {
  title?: string
  subtitle?: string
  maxWidth?: string
  disableGutters?: boolean
}

/**
 * Authors Grid Widget
 * Displays blog authors in a grid layout with the first author featured (2x2 space)
 * and remaining authors in a 4-column grid
 *
 * Server component that fetches authors data
 */
export const AuthorsWidget = async ({
  title,
  subtitle,
  maxWidth = 'lg',
  disableGutters
}: AuthorsWidgetProps) => {
  if (!features.blog) return null

  const t = await getTranslations('CmsWidgets')

  let authors: ContentAuthor[]
  try {
    const client = CmsService.getBlogClient()
    authors = await client.getAuthors({ roles: ['editor', 'administrator'] })
  } catch {
    return null
  }

  // Get featured authors from config
  const featuredAuthors = blogConfig.featuredAuthors || []

  // Filter by slugs if whitelist is provided
  const filtered = featuredAuthors.length
    ? authors.filter((author) => featuredAuthors.includes(author.slug))
    : authors

  // Sort by order in featuredAuthors array, fallback to ID
  const sorted = filtered.sort((a, b) => {
    // If we have a whitelist, sort by the order in the array
    if (featuredAuthors.length) {
      const indexA = featuredAuthors.indexOf(a.slug)
      const indexB = featuredAuthors.indexOf(b.slug)

      // Both in whitelist - sort by position in whitelist
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }

      // Only A in whitelist - A comes first
      if (indexA !== -1) return -1

      // Only B in whitelist - B comes first
      if (indexB !== -1) return 1
    }

    // Fallback to ID sorting
    return a.id.localeCompare(b.id, undefined, { numeric: true })
  })

  if (!sorted.length) {
    return (
      <Container
        maxWidth={maxWidth as Breakpoint}
        disableGutters={disableGutters}
      >
        <Typography>{t('noAuthors')}</Typography>
      </Container>
    )
  }

  const [featuredAuthor, ...gridAuthors] = sorted

  return (
    <Container
      maxWidth={maxWidth as Breakpoint}
      disableGutters={disableGutters}
    >
      <Stack spacing={4}>
        {(title || subtitle) && (
          <Stack spacing={1}>
            {title && (
              <Typography variant="h3">
                <WidgetHtmlText>{title}</WidgetHtmlText>
              </Typography>
            )}
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                <WidgetHtmlText>{subtitle}</WidgetHtmlText>
              </Typography>
            )}
          </Stack>
        )}
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 4 },
            gridAutoRows: { md: '260px' },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            }
          }}
        >
          {/* Featured author - takes 2x2 grid cells */}
          <Box
            sx={{
              gridRow: { md: 'span 2' },
              gridColumn: { sm: 'span 2', md: 'span 2' },
              minHeight: { xs: 400, sm: 640, md: 'auto' }
            }}
          >
            <AuthorCard author={featuredAuthor} />
          </Box>

          {/* Remaining authors fill naturally */}
          {gridAuthors.map((author) => (
            <Box key={author.id} sx={{ minHeight: { xs: 400, md: 'auto' } }}>
              <AuthorCard author={author} />
            </Box>
          ))}
        </Box>
      </Stack>
    </Container>
  )
}
