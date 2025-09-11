import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const SummaryDetails = () => {
  const { homeDetails } = usePropertyDetails()
  const t = useTranslations()

  return (
    <Stack spacing={4} id="details">
      <Typography variant="h4">{t('pdp.sections.home.name')}</Typography>
      <DetailsList mode="columns">
        {homeDetails.map((group, index) => (
          <DetailsGroup breakInside="auto" key={index} group={group} />
        ))}
      </DetailsList>
    </Stack>
  )
}

export default SummaryDetails
