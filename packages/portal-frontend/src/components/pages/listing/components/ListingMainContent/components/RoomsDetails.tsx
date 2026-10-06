import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'

export const RoomsDetails = () => {
  const { rooms } = useListingDetails()
  const t = useTranslations()

  if (!rooms.length) return null

  return (
    <DetailsContainer title={t('PDP.sections.rooms.name')} id="rooms">
      <DetailsList>
        {rooms.map((room) => (
          <DetailsGroup
            key={room.title}
            group={room}
            scrubbedValue="****"
            breakInside={rooms.length > 1 ? 'avoid' : 'auto'}
          />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}
