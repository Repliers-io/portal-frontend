import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'
import {
  DetailsChipsGroup,
  DetailsGroup,
  DetailsList
} from '@shared/DetailsList'

import { useListingDetails } from 'providers/ListingDetailsProvider'
import type { DetailsGroupType } from 'utils/dataMapper'

const chipsGroup = (group: DetailsGroupType) =>
  Array.isArray(group.items[0]?.value)

// Chip groups (Nearby, Amenities) each take a full row, in config order; the
// key/value groups follow in the two-column list every other section uses.
export const CondominiumDetails = () => {
  const { condominium } = useListingDetails()
  const t = useTranslations()

  if (!condominium.length) return null

  const chips = condominium.filter(chipsGroup)
  const fields = condominium.filter((group) => !chipsGroup(group))

  return (
    <DetailsContainer
      title={t('PDP.sections.condominium.name')}
      id="condominium"
    >
      <Stack spacing={2}>
        {chips.map((group, index) => (
          <DetailsChipsGroup key={index} group={group} />
        ))}
        {fields.length > 0 && (
          <DetailsList>
            {fields.map((group, index) => (
              <DetailsGroup key={index} group={group} />
            ))}
          </DetailsList>
        )}
      </Stack>
    </DetailsContainer>
  )
}
