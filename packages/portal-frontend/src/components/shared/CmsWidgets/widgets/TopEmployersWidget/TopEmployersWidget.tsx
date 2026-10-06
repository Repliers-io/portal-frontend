import { getTranslations } from 'next-intl/server'

import { Box, Container, Stack, Typography } from '@mui/material'

import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import EmployerCard from './EmployerCard'

const employers = [
  { name: 'Amazon', logo: '/urbn/employers/amazon.svg' },
  { name: 'Google', logo: '/urbn/employers/google.svg' },
  { name: 'Facebook', logo: '/urbn/employers/facebook.svg' },
  { name: 'Microsoft', logo: '/urbn/employers/microsoft.svg' },
  { name: 'Zillow', logo: '/urbn/employers/zillow.svg' },
  { name: 'University of Washington', logo: '/urbn/employers/uw.svg' }
]

export const TopEmployersWidget = async () => {
  const t = await getTranslations('CmsWidgets')

  return (
    <WidgetWrapper
      maxWidth={false}
      bgcolor="common.black"
      sx={{
        py: 6,
        backgroundImage: 'url(/urbn/top-employers-bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Typography
            variant="h3"
            color="common.white"
            sx={{ my: '0 !important' }}
          >
            {t('topEmployersTitle')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: { xs: 2, md: 4 }
            }}
          >
            {employers.map((employer) => (
              <EmployerCard key={employer.name} {...employer} />
            ))}
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
