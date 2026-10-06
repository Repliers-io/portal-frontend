import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const ExteriorDetails = () => {
  const { exterior } = useListingDetails()
  const t = useTranslations()

  if (!exterior || exterior.length === 0) return null

  return (
    <DetailsContainer title={t('PDP.sections.exterior.name')} id="exterior">
      <DetailsList>
        {exterior.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}
