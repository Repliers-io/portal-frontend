import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const AppliancesDetails = () => {
  const { appliances } = usePropertyDetails()
  const t = useTranslations()

  if (!appliances.length) return null

  return (
    <DetailsContainer title={t('pdp.sections.appliances.name')} id="appliances">
      <DetailsList>
        {appliances.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default AppliancesDetails
