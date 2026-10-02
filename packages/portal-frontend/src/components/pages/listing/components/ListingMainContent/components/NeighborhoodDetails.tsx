import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsChipsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const NeighborhoodDetails = () => {
  const { neighborhood } = useListingDetails()
  const t = useTranslations()

  if (!neighborhood.length) return null

  return (
    <DetailsContainer
      title={t('PDP.sections.neighborhood.name')}
      id="neighborhood"
    >
      <DetailsList mode="flex">
        {neighborhood.map((group, index) => (
          <DetailsChipsGroup key={index} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}
