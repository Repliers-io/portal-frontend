'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { useBuilding } from 'providers/BuildingProvider'

import { BuildingSectionContainer } from './BuildingSectionContainer'

export const BuildingFAQ = () => {
  const { faqs } = useBuilding()
  const t = useTranslations('Building')

  if (!faqs?.length) return null

  return (
    <BuildingSectionContainer id="faq" title={t('faqTitle')}>
      <Stack spacing={2}>
        {faqs.map((faq, index) => (
          <Stack key={index} spacing={1}>
            <Typography variant="h5">{faq.question}</Typography>
            <CmsContentRenderer content={faq.answer} />
          </Stack>
        ))}
      </Stack>
    </BuildingSectionContainer>
  )
}
