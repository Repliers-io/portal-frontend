import React from 'react'
import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import { type EstimatePayload } from '@configs/estimate'

import { useEstimate } from 'providers/EstimateProvider'
import { homeFactsResolver } from 'utils/dataMapper'

import PropertyItem from './PropertyItem'

const spacing = 4

const PropertyList = () => {
  const t = useTranslations('Estimates.homeFacts')
  const { estimateData, financialData, editing } = useEstimate()
  let { payload } = estimateData || {}
  if (editing) {
    payload = {
      ...payload,
      data: { ...financialData }
    } as EstimatePayload
  }

  const properties = homeFactsResolver(payload!)

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        columnGap: { xs: 0, md: 4 },
        columnCount: { xs: 1, md: 2 },
        columnFill: 'balance',
        '& > *': { mb: spacing, '&:last-of-type': { mb: 0 } }
      }}
    >
      {properties.map((property) => {
        const { value, label = '' } = property
        // labels are i18n keys in the Estimates.homeFacts namespace
        return <PropertyItem key={label} label={t(label)} value={value} />
      })}
    </Box>
  )
}

export default PropertyList
