import React from 'react'

import { Box, Stack } from '@mui/material'

import listingsConfig from '@configs/listings'

import { type ApiLastStatus, type HistoryItemType } from 'services/API'
import { useListing } from 'providers/ListingProvider'

import { getHistoryItemLink } from '../utils'

import {
  HistoryItemHeader,
  HistoryItemPhoto,
  HistoryItemProgressBar,
  HistoryItemRow
} from '.'

export const HistoryItem = ({
  item,
  active = false,
  last = false
}: {
  item: HistoryItemType
  active?: boolean
  last?: boolean
}) => {
  const {
    type,
    office,
    mlsNumber,
    lastStatus,
    timestamps,
    listPrice,
    soldPrice,
    listDate
  } = item
  const { unavailableDate, idxUpdated, listingEntryDate } = timestamps
  const startDate = listingEntryDate || listDate // use listDate as fallback, when listingEntryDate is not available
  const endDate = unavailableDate || idxUpdated

  const { listing } = useListing()
  const link = getHistoryItemLink(listing, item, active)

  const startLabel = `Listed For ${type}`
  const endLabel = listingsConfig.statusLabels[lastStatus as ApiLastStatus]

  return (
    <Box>
      <Stack spacing={4} direction="row" justifyContent="stretch">
        <HistoryItemProgressBar last={last} active={active} />

        <Stack spacing={2} flex={1}>
          <HistoryItemHeader
            link={link}
            active={active}
            office={office}
            endDate={endDate!}
            startDate={startDate!}
          />

          <Stack
            spacing={2}
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <Box
              key={mlsNumber}
              sx={{
                p: 2,
                pl: { xs: 2, lg: 4 },
                flex: 1,
                borderRadius: 2,
                bgcolor: 'background.default'
              }}
            >
              <Stack
                spacing={2}
                direction="row"
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center'
                }}
                justifyContent="space-between"
              >
                <Stack spacing={2} direction="row" alignItems="center" flex={1}>
                  <Stack
                    flex={1}
                    spacing={{ xs: 2, sm: 0.5 }}
                    direction={{ xs: 'row', sm: 'column' }}
                    flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                  >
                    {endDate && (
                      <HistoryItemRow
                        date={endDate}
                        label={endLabel}
                        price={soldPrice}
                      />
                    )}

                    <HistoryItemRow
                      date={startDate!}
                      label={startLabel}
                      price={listPrice}
                    />
                  </Stack>
                </Stack>

                <HistoryItemPhoto item={item} active={active} />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
