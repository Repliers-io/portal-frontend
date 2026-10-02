import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'

import { toRem } from 'utils/theme'

const { siteName, siteFooterLogo: logo } = content

const Footer = async () => {
  const t = await getTranslations()

  return (
    <Box bgcolor="background.default" py={6}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 0, md: 9, lg: 12 }}
            width="100%"
          >
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Image
                  alt={siteName}
                  src={logo.url}
                  width={logo.width}
                  height={logo.height}
                />
              </Stack>
              <Typography py={2} pt={1} color="text.hint" whiteSpace="pre-line">
                {t('Footer.description')}
              </Typography>
            </Box>
            <Stack
              py={2}
              direction="row"
              sx={{ flex: 1 }}
              spacing={{ xs: 2, md: 4 }}
            >
              <Box
                sx={{
                  flex: 1,
                  color: 'text.hint',
                  fontSize: toRem(14)
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h5">About</Typography>
                  <Link href="/blog">News</Link>
                  <Link href="/page/widgets-test">Widgets Test Page</Link>
                  <Link href={`${routes.estimate}/embedded/demo`}>
                    Estimate Widgets
                  </Link>
                </Stack>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  color: 'text.hint',
                  fontSize: toRem(14)
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h5">Company</Typography>
                  <Link href="/blog">Blog</Link>
                  <Link href="/">News</Link>
                  <Link href="/">Partner With Us</Link>
                </Stack>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  color: 'text.hint',
                  fontSize: toRem(14)
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h5">Support</Typography>
                  <Link href="/">Account</Link>
                  <Link href="/">Feedback</Link>
                  <Link href="/">Contact Us</Link>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Stack
            spacing={1}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'center', md: 'space-between' }}
          >
            <Typography
              variant="body2"
              sx={{ order: { xs: 3, md: 1 }, px: { xs: 2, md: 0 } }}
            >
              All rights reserved {new Date().getFullYear()} &copy; {siteName}{' '}
              Inc.
            </Typography>
            <Typography
              variant="body2"
              color="text.hint"
              sx={{ order: { xs: 1, md: 2 }, px: { xs: 2, md: 0 } }}
            >
              {features.estimate && (
                <>
                  <Link href={routes.estimate}>Instant Estimates</Link>
                  {' • '}
                </>
              )}
              <Link href={`${routes.staticPage}/terms-of-use`}>Terms</Link>
              {' • '}
              <Link href={`${routes.staticPage}/privacy-policy`}>Privacy</Link>
              {' • '}
              <Link href={`${routes.staticPage}/cookies-policy`}>Cookies</Link>
            </Typography>
            <Typography
              variant="body2"
              sx={{ order: { xs: 2, md: 3 }, px: { xs: 2, md: 0 } }}
            >
              Powered By{' '}
              <a
                href="https://www.repliers.com/"
                style={{ textDecoration: 'underline' }}
              >
                Repliers Real Estate APIs
              </a>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
