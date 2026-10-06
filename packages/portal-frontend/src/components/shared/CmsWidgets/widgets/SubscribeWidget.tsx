'use client'

import { useTranslations } from 'next-intl'

import { Box, Container, Stack, Typography } from '@mui/material'

import { SubscribeForm } from '@shared/Forms'

import { WidgetHtmlText } from '../components'
import { WidgetWrapper } from '../WidgetWrapper'

interface SubscribeWidgetProps {
  title?: string
  subtitle?: string
  bgcolor?: string
  submit?: string
  redirectUrl?: string
  formAlign?: 'left' | 'right'
}

export const SubscribeWidget = ({
  title,
  subtitle,
  bgcolor = 'background.default',
  submit,
  redirectUrl,
  formAlign = 'right'
}: SubscribeWidgetProps = {}) => {
  const t = useTranslations('Forms')
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
                <WidgetHtmlText>{title ?? t('subscribeTitle')}</WidgetHtmlText>
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <WidgetHtmlText>
                  {subtitle ?? t('subscribeSubtitle')}
                </WidgetHtmlText>
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flex: 1 }}>
            <SubscribeForm submit={submit} redirectUrl={redirectUrl} />
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
