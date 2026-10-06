import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Typography } from '@mui/material'

const bold = { b: (chunks: ReactNode) => <b>{chunks}</b> }

export const Annotation = () => {
  const t = useTranslations('Dialogs')

  return (
    <Typography variant="caption" component="div" color="text.hint" pl={1.5}>
      <li>{t.rich('AdvancedFilters.qualityExcellent', bold)}</li>
      <li>{t.rich('AdvancedFilters.qualityGood', bold)}</li>
      <li>{t.rich('AdvancedFilters.qualityAverage', bold)}</li>
      <li>{t.rich('AdvancedFilters.qualityFair', bold)}</li>
      <li>{t.rich('AdvancedFilters.qualityPoor', bold)}</li>
    </Typography>
  )
}
