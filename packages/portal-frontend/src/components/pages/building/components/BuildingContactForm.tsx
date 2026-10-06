'use client'

import { useTranslations } from 'next-intl'

import { Box, Paper, Stack, Typography } from '@mui/material'

import { ContactForm } from '@shared/Forms'

import { BuildingFormAgreementText } from './BuildingFormAgreementText'

interface BuildingContactFormProps {
  initialMessage?: string
  title?: string
}

export const BuildingContactForm = ({
  initialMessage,
  title
}: BuildingContactFormProps) => {
  const t = useTranslations('Building')

  return (
    <Paper
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        boxShadow: 1
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5">{title ?? t('contactTitle')}</Typography>

          <Box sx={{ pt: 1 }}>
            <ContactForm labels message={initialMessage} />
          </Box>
        </Box>

        <BuildingFormAgreementText />
      </Stack>
    </Paper>
  )
}
