import React from 'react'
import Image from 'next/image'

import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'

const { siteName, siteFooterDescription, siteFooterLogo: logo } = content

const Footer = () => {
  return (
    <Box bgcolor="common.black" color="common.white" py={6}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={{ xs: 4, md: 12 }}
            width="100%"
          >
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: 416 } }}>
              <Stack
                spacing={2}
                direction="column"
                alignItems={{ xs: 'center', md: 'flex-start' }}
              >
                <Image
                  unoptimized
                  alt={siteName}
                  src={logo.url}
                  width={logo.width}
                  height={logo.height}
                />
              </Stack>
              <Typography
                pt={3}
                fontSize={12}
                lineHeight={1.2}
                color="#CCCCCC"
                whiteSpace="pre-line"
              >
                {siteFooterDescription}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 2, lg: 4 }}
              sx={{
                maxWidth: { xs: '100%', md: 560 },
                flex: 1,
                '& a': {
                  textDecoration: 'none',
                  transition: 'color 0.2s linear, text-decoration 0.2s linear',
                  '&:hover': { textDecoration: 'underline', color: '#FFFFFF' }
                }
              }}
            >
              <Typography
                component="div"
                color="#CCCCCC"
                lineHeight={1.2}
                sx={{ flex: 1 }}
              >
                <Stack
                  spacing={5}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography variant="h4" color="common.white">
                    Socials
                  </Typography>
                  <Stack
                    spacing={1.5}
                    textAlign={{ xs: 'center', md: 'left' }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                  >
                    <Link
                      href="https://www.instagram.com/bakerrei/"
                      target="_blank"
                    >
                      Instagram
                    </Link>
                    <Link
                      href="https://www.facebook.com/bakerrei/"
                      target="_blank"
                    >
                      Facebook
                    </Link>
                    <Link
                      href="https://www.youtube.com/user/Bakerrealestateinc"
                      target="_blank"
                    >
                      YouTube
                    </Link>
                    <Link
                      href="https://www.linkedin.com/company/baker-real-estate"
                      target="_blank"
                    >
                      LinkedIn
                    </Link>

                    <Link
                      href="https://www.threads.net/@bakerrei"
                      target="_blank"
                    >
                      Threads
                    </Link>
                    <Link href="https://twitter.com/bakerinc" target="_blank">
                      X
                    </Link>
                  </Stack>
                </Stack>
              </Typography>
              <Typography
                component="div"
                color="#CCCCCC"
                lineHeight={1.2}
                sx={{ flex: 1 }}
              >
                <Stack
                  spacing={5}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography variant="h4" color="common.white">
                    Company
                  </Typography>
                  <Stack
                    spacing={1.5}
                    textAlign={{ xs: 'center', md: 'left' }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                  >
                    <Link href="https://baker-re.com/about-us/" target="_blank">
                      About Us
                    </Link>
                    <Link href="https://baker-re.com/projects/" target="_blank">
                      Projects
                    </Link>
                    <Link
                      href="https://baker-re.com/developers/"
                      target="_blank"
                    >
                      Developers
                    </Link>
                    <Link
                      href="https://baker-re.com/buyers-investors/"
                      target="_blank"
                    >
                      Buyers & Investors
                    </Link>
                    <Link href="https://baker-re.com/brokers/" target="_blank">
                      Brokers
                    </Link>

                    <Link href="https://baker-re.com/blog/" target="_blank">
                      Blog
                    </Link>
                  </Stack>
                </Stack>
              </Typography>
              <Typography
                component="div"
                color="#CCCCCC"
                lineHeight={1.2}
                sx={{
                  boxSizing: 'border-box',
                  flex: { xs: 1.1, md: 0.95, lg: 1.3 },
                  pr: { xs: 0, md: 1, lg: 0 }
                }}
              >
                <Stack
                  spacing={5}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography
                    variant="h4"
                    textAlign="center"
                    color="common.white"
                  >
                    Contact Us
                  </Typography>
                  <Stack
                    spacing={1.5}
                    textAlign={{ xs: 'center', md: 'left' }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                  >
                    <Link
                      href="https://maps.app.goo.gl/kA7QUUBn9pNkksuY8"
                      target="_blank"
                    >
                      <Box sx={{ pb: 1.5 }}>Head Office</Box>
                      <Box>
                        3080 Yonge Street, <nobr>Suite 3056</nobr> <br />
                        <nobr>Toronto, Ontario,</nobr> <nobr>M4N 3N1</nobr>
                      </Box>
                    </Link>
                    <Link href="mailto:mls@baker-re.com">mls@baker-re.com</Link>
                    <Link href="tel:4169234621">416.923.4621</Link>
                  </Stack>
                </Stack>
              </Typography>
            </Stack>
          </Stack>
          <Stack
            spacing={2}
            alignItems="center"
            direction={{ xs: 'column', md: 'row' }}
            justifyContent={{ xs: 'center', md: 'space-between' }}
            sx={{
              '& a': { transition: 'color 0.2s linear' },
              '& a:hover': { color: 'primary.main' }
            }}
          >
            <Typography color="common.white" textAlign="center" variant="body2">
              Copyright &copy; Baker Real Estate Incorporated, Brokerage{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                1993-
                {new Date().getFullYear()}
              </span>
            </Typography>

            <Box>
              <Typography
                color="common.white"
                textAlign="center"
                variant="body2"
              >
                <Link href="https://peeragerealty.com/">
                  A Peerage Realty Partner
                </Link>{' '}
                |{' '}
                <Link href="https://baker-re.com/privacy-policy/">
                  Privacy Policy
                </Link>{' '}
                | <Link href="https://baker-re.com/aoda/">AODA</Link> |{' '}
                <Link href="https://baker-re.com/casl/">CASL</Link>
              </Typography>
            </Box>

            <Typography variant="body2" textAlign="right" color="common.white">
              Powered by{' '}
              <Link href="https://repliers.com/" target="_blank">
                Repliers
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
