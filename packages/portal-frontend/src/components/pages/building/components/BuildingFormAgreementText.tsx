'use client'

import { useTranslations } from 'next-intl'

import { Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'

export const BuildingFormAgreementText = () => {
  const t = useTranslations('Forms')

  const { contactEmail } = content

  return (
    <Stack spacing={1}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ '& a': { color: 'primary.main' } }}
      >
        {t('alternativeContact')}{' '}
        <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
      </Typography>
    </Stack>
  )
}
