import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const FeaturesDetails = () => {
  const { features } = usePropertyDetails()
  const t = useTranslations()

  if (!features.length) return null

  return (
    <DetailsContainer title={t('pdp.sections.features.name')} id="features">
      <DetailsList>
        {features.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default FeaturesDetails
