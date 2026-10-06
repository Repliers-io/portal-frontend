'use client'

import { useTranslations } from 'next-intl'

import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import { ContactForm } from '@shared/Forms'

import { WidgetHtmlText } from '../components'
import { WidgetWrapper } from '../WidgetWrapper'

interface ContactWidgetProps {
  title?: string
  subtitle?: string
  bgcolor?: string
  submit?: string
  showMessage?: boolean
  redirectUrl?: string
  message?: string
  formAlign?: 'left' | 'right'
  // FUB tags attached to the leads this CMS form produces.
  tags?: string[]
}

export const ContactWidget = ({
  title,
  subtitle,
  bgcolor = 'background.default',
  submit,
  showMessage,
  redirectUrl,
  message,
  formAlign = 'right',
  tags
}: ContactWidgetProps = {}) => {
  const t = useTranslations('Forms')

  const { contactEmail, contactPhone } = content

  return (
    <WidgetWrapper maxWidth={false} bgcolor={bgcolor}>
      <Container maxWidth="lg">
        <Stack
          direction={{
            xs: 'column',
            md: formAlign === 'left' ? 'row-reverse' : 'row'
          }}
          spacing={{ xs: 2, md: 4 }}
          alignItems={{ md: 'center' }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack spacing={2} sx={{ pr: 4 }}>
              <Typography variant="h3" component="h2">
                <WidgetHtmlText>{title ?? t('contactTitle')}</WidgetHtmlText>
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <WidgetHtmlText>
                  {subtitle ?? t('contactSubtitle')}
                </WidgetHtmlText>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ '& a': { color: 'primary.main' } }}
              >
                {t('alternativeContact')}{' '}
                <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
                {' | '}
                <Link href={`tel:${contactPhone}`}>{contactPhone}</Link>
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flex: 1 }}>
            <ContactForm
              submit={submit}
              showMessage={showMessage}
              redirectUrl={redirectUrl}
              message={message}
              tags={tags}
            />
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
