import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const HomeDetails = () => {
  const { homeDetails } = useListingDetails()
  const t = useTranslations()

  return (
    <Stack spacing={{ xs: 3, sm: 4 }} id="details">
      <Typography variant="h4">{t('PDP.sections.details.name')}</Typography>
      <DetailsList mode="columns">
        {homeDetails.map((group, index) => (
          <DetailsGroup breakInside="auto" key={index} group={group} />
        ))}
      </DetailsList>
    </Stack>
  )
}
