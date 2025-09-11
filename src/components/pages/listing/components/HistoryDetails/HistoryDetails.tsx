import React from 'react'

import { Stack } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'

import { type HistoryItemType, type Property } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { rent, sold } from 'utils/properties'

import { HistoryItem } from '.'

const getListingData = (property: Property): HistoryItemType => ({
  lastStatus: property.lastStatus,
  mlsNumber: property.mlsNumber,
  listDate: property.listDate,
  listPrice: property.listPrice,
  timestamps: property.timestamps,
  soldDate: property.soldDate,
  soldPrice: +property.soldPrice,
  office: property.office,
  type: property.type,
  images: property.images
})

const getActiveItem = (property: Property): HistoryItemType =>
  ({
    mlsNumber: property.mlsNumber,
    timestamps: { listingEntryDate: property.listDate },
    type: rent(property) ? 'Rent' : 'Sale',
    listPrice: Number(property.listPrice),
    images: property.images
  }) as HistoryItemType

const HistoryDetails = () => {
  const { property } = useProperty()
  const { mlsNumber, history = [] } = property
  const soldProperty = sold(property)
  const shouldShowActiveItem = soldProperty
    ? false // hide for sold properties
    : !history.length || history[0].mlsNumber !== mlsNumber

  if (!history.length && !shouldShowActiveItem) return null

  return (
    <DetailsContainer title="Sale History" id="history">
      <Stack spacing={3}>
        {shouldShowActiveItem && (
          <HistoryItem
            key={mlsNumber}
            item={getActiveItem(property)}
            active
            last={!history.length}
          />
        )}

        {history.map((item, index) => {
          const active = index === 0 && mlsNumber === item.mlsNumber
          const current = active ? getListingData(property) : item
          const last = index === history.length - 1
          return (
            <HistoryItem
              key={index}
              item={current}
              last={last}
              active={active}
            />
          )
        })}
      </Stack>
    </DetailsContainer>
  )
}

export default HistoryDetails
