import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const AppliancesDetails = () => {
  const { appliances } = useListingDetails()
  const t = useTranslations()

  if (!appliances.length) return null

  return (
    <DetailsContainer title={t('PDP.sections.appliances.name')} id="appliances">
      <DetailsList>
        {appliances.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}
