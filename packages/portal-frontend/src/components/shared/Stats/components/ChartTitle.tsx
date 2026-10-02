import React from 'react'
import { useTranslations } from 'next-intl'

import { CircularProgress, Stack, Typography } from '@mui/material'

import { type PropertyClass } from '@configs/filters'
import { type ChartAction, getActionLabel } from '@shared/Stats'

export const ChartTitle = ({
  action,
  loading,
  propertyClass
}: {
  action: ChartAction
  loading?: boolean
  propertyClass: PropertyClass
}) => {
  const t = useTranslations()

  return (
    <Stack
      direction="row"
      sx={{ flex: 2 }}
      alignItems="center"
      spacing={{ xs: 2, sm: 3 }}
    >
      <Typography variant="h4" noWrap>
        {getActionLabel(action, propertyClass, t)}
      </Typography>
      {loading && <CircularProgress size={16} />}
    </Stack>
  )
}
