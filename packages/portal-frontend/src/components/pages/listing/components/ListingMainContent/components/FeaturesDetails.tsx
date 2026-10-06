import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const FeaturesDetails = () => {
  const { features } = useListingDetails()
  const t = useTranslations()

  if (!features.length) return null

  return (
    <DetailsContainer title={t('PDP.sections.features.name')} id="features">
      <DetailsList>
        {features.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}
