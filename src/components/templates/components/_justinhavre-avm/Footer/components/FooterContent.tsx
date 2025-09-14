import React from 'react'
import Image from 'next/image'

import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'

const { siteFooterLogo: logo, siteName } = content

export const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/justinhavre/',
    icon: FacebookIcon
  },
  {
    name: 'Twitter',
    url: 'https://x.com/justinhavre',
    icon: XIcon
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/justinhavreteam/',
    icon: InstagramIcon
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@justinhavreteam',
    icon: YouTubeIcon
  }
]

const FooterContent = () => {
  return (
    <Box bgcolor="primary.main">
      <Container>
        <Stack
          py={{
            xs: 2,
            md: 5
          }}
          direction="row"
          justifyContent={{ xs: 'space-around', md: 'space-between' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          flexWrap="wrap"
          spacing={2}
        >
          <Box>
            <Image
              priority
              unoptimized
              alt={siteName}
              src={logo.url}
              width={logo.width}
              height={logo.height}
            />
          </Box>
          <Typography variant="body1" fontWeight={700} color="common.white">
            Justin Havre Real Estate Team
            <br />
            eXp Realty
            <Typography
              component="span"
              display="block"
              variant="body1"
              color="common.white"
            >
              <Link
                href="tel:+14032170003"
                underline="hover"
                style={{ fontWeight: 700 }}
              >
                403.217.0003
              </Link>
            </Typography>
          </Typography>
          <Typography variant="body1" fontWeight={700} color="common.white">
            #140 115 Quarry Park Road S.E
            <br />
            Calgary, AB T2C 5G3
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            {socialLinks.map(({ name, url, icon: Icon }) => (
              <Link
                key={name}
                href={url}
                target="_blank"
                color="common.white"
                sx={{
                  '&:hover': { opacity: 0.7 },
                  transition: 'opacity 0.3s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '40px',
                  width: '40px'
                }}
              >
                <Icon fontSize="small" />
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default FooterContent
