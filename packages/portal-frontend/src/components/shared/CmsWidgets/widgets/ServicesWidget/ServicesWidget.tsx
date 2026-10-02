import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Box, Container, Stack, Typography } from '@mui/material'

import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import { toRem } from 'utils/theme'

import ServiceCard from './ServiceCard'

export const ServicesWidget = async () => {
  const t = await getTranslations('CmsWidgets')

  const services = [
    {
      title: t('servicesBuyerTitle'),
      description: t('servicesBuyerDescription'),
      buttonText: t('servicesBuyerButton'),
      href: '/search/map'
    },
    {
      title: t('servicesSellerTitle'),
      description: t('servicesSellerDescription'),
      buttonText: t('servicesSellerButton'),
      href: '/sell'
    }
  ]

  return (
    <WidgetWrapper
      maxWidth={false}
      bgcolor="common.black"
      sx={{ py: { xs: 4, md: 6 } }}
    >
      <Image
        src="/urbn/services-bg.webp"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        style={{ objectFit: 'cover', objectPosition: 'top center' }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack spacing={4}>
          <Stack direction="column" spacing={0.5}>
            <Typography variant="h3" color="common.white">
              {t('servicesTitle')}
            </Typography>
            <Typography
              variant="body1"
              fontSize={toRem(18)}
              color="common.white"
            >
              {t('servicesSubtitle')}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)'
              },
              gap: { xs: 2, md: 4 }
            }}
          >
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
