import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsChipsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const NeighborhoodDetails = () => {
  const { neighborhood } = usePropertyDetails()
  const t = useTranslations()

  if (!neighborhood.length) return null

  return (
    <DetailsContainer
      title={t('pdp.sections.neighborhood.name')}
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

export default NeighborhoodDetails
