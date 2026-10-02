import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Stack, Typography } from '@mui/material'

import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import PlatformCard from './PlatformCard'

const platforms = [
  {
    name: 'YouTube',
    logo: '/urbn/platforms/youtube.svg',
    href: 'https://www.youtube.com/@urban-living'
  },
  {
    name: 'The Seattle Times',
    logo: '/urbn/platforms/seattle-times.svg',
    href: 'https://www.seattletimes.com/'
  },
  {
    name: 'MyNorthwest',
    logo: '/urbn/platforms/mynorthwest.svg',
    href: 'https://mynorthwest.com/'
  },
  {
    name: 'Puget Sound Business Journal',
    logo: '/urbn/platforms/puget-sound.svg',
    href: 'https://www.bizjournals.com/seattle/'
  }
]

export const MediaPlatformsWidget = async () => {
  const t = await getTranslations('CmsWidgets')

  return (
    <WidgetWrapper
      maxWidth={false}
      bgcolor="common.black"
      sx={{ py: { xs: 4, md: 6 } }}
    >
      <Image
        src="/urbn/platform-bg.webp"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack spacing={4}>
          <Typography variant="h3" color="common.white">
            {t('asSeenOn')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2, md: 4 }
            }}
          >
            {platforms.map((platform) => (
              <PlatformCard key={platform.name} {...platform} />
            ))}
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
