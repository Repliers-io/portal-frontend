import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type React from 'react'

import { CircularProgress, Stack, Typography } from '@mui/material'

import { type PropertyClass } from '@configs/filters'
import { type ChartAction, getActionLabel } from '@shared/Stats'
import growthImg from 'assets/common/growth.svg'

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
    <Stack spacing={3} direction="row" alignItems="center" sx={{ flex: 2 }}>
      <Image
        alt="growth"
        width={28}
        height={28}
        src={growthImg}
        style={{ display: 'block' }}
      />
      <Typography variant="h4" noWrap>
        {getActionLabel(action, propertyClass, t)}
      </Typography>
      {loading && <CircularProgress size={16} />}
    </Stack>
  )
}
