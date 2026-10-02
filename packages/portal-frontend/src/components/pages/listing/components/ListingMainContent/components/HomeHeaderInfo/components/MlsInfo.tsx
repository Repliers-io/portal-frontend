import { useTranslations } from 'next-intl'

import { Typography } from '@mui/material'

import { type ApiListing } from 'services/API'

export const MlsInfo = ({ listing }: { listing: ApiListing }) => {
  const t = useTranslations()
  const { mlsNumber } = listing
  return (
    <Typography color="text.hint">
      {t('PDP.mlsNumberLabel')} {mlsNumber}
    </Typography>
  )
}
