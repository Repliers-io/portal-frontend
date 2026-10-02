'use client'

import React from 'react'

import { Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

interface SectionDefaultProps {
  heading?: string
  content: string
}

export const SectionDefault = ({ heading, content }: SectionDefaultProps) => {
  return (
    <Stack spacing={2}>
      {heading && <Typography variant="h3">{heading}</Typography>}
      <CmsContentRenderer content={content} />
    </Stack>
  )
}
