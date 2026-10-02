import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'

import { useListing } from 'providers/ListingProvider'
import { sold } from 'utils/listings'

import { HistoryItem } from './components'
import { getActiveItem, getListingData } from './utils'

export const HistoryDetails = () => {
  const t = useTranslations()
  const { listing } = useListing()
  const { mlsNumber, history = [] } = listing
  const soldListing = sold(listing)
  const shouldShowActiveItem = soldListing
    ? false // hide for sold properties
    : !history.length || history[0].mlsNumber !== mlsNumber

  if (!history.length && !shouldShowActiveItem) return null

  return (
    <DetailsContainer title={t('PDP.sections.history.name')} id="history">
      <Stack spacing={3}>
        {shouldShowActiveItem && (
          <HistoryItem
            key={mlsNumber}
            item={getActiveItem(listing)}
            active
            last={!history.length}
          />
        )}

        {history.map((item, index) => {
          const active = index === 0 && mlsNumber === item.mlsNumber
          const current = active ? getListingData(listing) : item
          const last = index === history.length - 1
          return (
            <HistoryItem
              key={index}
              item={current}
              active={active}
              last={last}
            />
          )
        })}
      </Stack>
    </DetailsContainer>
  )
}
