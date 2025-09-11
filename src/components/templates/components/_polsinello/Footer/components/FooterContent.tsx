import React from 'react'
import Image from 'next/image'

import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'

const { siteName, siteFooterLogo: logo } = content

export const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/ThePolsinelloTeam',
    icon: FacebookIcon
  },
  {
    name: 'Twitter',
    url: 'https://x.com/PolsinelloTeam',
    icon: XIcon
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/thepolsinelloteam/',
    icon: InstagramIcon
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/thepolsinelloteam/',
    icon: LinkedInIcon
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCKLfI-tlBW0mydx70nV8-qQ',
    icon: YouTubeIcon
  }
]

const FooterContent = () => {
  return (
    <Box bgcolor="secondary.light">
      <Container>
        <Stack
          py={{
            xs: 2,
            md: 5
          }}
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          spacing={2}
        >
          <Box
            width={{
              xs: '100%',
              md: 'auto'
            }}
          >
            <Image
              priority
              unoptimized
              alt={siteName}
              src={logo.url}
              width={logo.width}
              height={logo.height}
            />
          </Box>
          <Typography
            width={{
              xs: '100%',
              md: 'auto'
            }}
            variant="body1"
            color="common.whiteTr70"
          >
            The Polsinello Team <br />
            eXp Realty, Brokerage <br />
            <Typography
              component="span"
              display="block"
              variant="body1"
              color="common.white"
            >
              <Link href="tel:+19058309111" underline="hover">
                (905) 830-9111
              </Link>
            </Typography>
          </Typography>
          <Typography
            width={{
              xs: '100%',
              md: 'auto'
            }}
            variant="body1"
            color="common.whiteTr70"
          >
            16700 Bayview Avenue Suite 211 <br />
            Newmarket, ON L3X 1W1
          </Typography>
          <Stack
            width={{
              xs: '100%',
              md: 'auto'
            }}
            direction="row"
            alignItems="center"
            spacing={1}
          >
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
