import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'

import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const RoomsDetails = () => {
  const { rooms } = usePropertyDetails()
  const t = useTranslations()

  if (!rooms.length) return null

  return (
    <DetailsContainer title={t('pdp.sections.rooms.name')} id="rooms">
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

export default RoomsDetails
