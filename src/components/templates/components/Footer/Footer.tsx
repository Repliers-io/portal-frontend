import React from 'react'
import Image from 'next/image'

import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import routes from '@configs/routes'

import { toRem } from 'utils/theme'

const { siteName, siteFooterDescription, siteFooterLogo: logo } = content

import { features } from 'features'

const Footer = () => {
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
                  unoptimized
                  alt={siteName}
                  src={logo.url}
                  width={logo.width}
                  height={logo.height}
                />
              </Stack>
              <Typography py={2} pt={1} color="text.hint" whiteSpace="pre-line">
                {siteFooterDescription}
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
                  <Link href="/">About Us</Link>
                  <Link href="/">News</Link>
                  <Link href="/">Careers</Link>
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
                  <Link href="/">Our Team</Link>
                  <Link href="/">Partner With Us</Link>
                  <Link href="/">FAQ</Link>
                  <Link href="/">Blog</Link>
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
                  <Link href="/">Support Center</Link>
                  <Link href="/">Feedback</Link>
                  <Link href="/">Contact Us</Link>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Typography
              textAlign={{ xs: 'center', md: 'left' }}
              color="text.hint"
              variant="body2"
            >
              {features.estimate && (
                <>
                  <Link href={routes.estimate}>Instant Estimates</Link>
                  {' • '}
                </>
              )}
              <Link href={routes.terms}>Terms</Link> •{' '}
              <Link href={routes.privacy}>Privacy</Link> •{' '}
              <Link href={routes.cookies}>Cookies</Link>
            </Typography>
            <Typography textAlign="center" variant="caption">
              All rights reserved {new Date().getFullYear()} &copy; {siteName}{' '}
              Inc. <br />
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
