import React from 'react'

import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import { Box, IconButton, Stack, Typography } from '@mui/material'

import {
  type HistoryItemType,
  type ListingLastStatus,
  listingLastStatusMapping
} from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { getSeoUrl } from 'utils/properties'
import { getCDNPath } from 'utils/urls'

import { HistoryItemHeader, HistoryItemProgressBar, HistoryItemRow } from '.'

const HistoryItem = ({
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
    listDate,
    images
  } = item
  const { unavailableDate, idxUpdated, listingEntryDate } = timestamps
  const startDate = listingEntryDate || listDate // use listDate as fallback, when listingEntryDate is not available
  const endDate = unavailableDate || idxUpdated

  const { property } = useProperty()
  const linkAvailable = lastStatus !== 'Ter' && !active
  const link = linkAvailable
    ? getSeoUrl({
        ...property,
        mlsNumber: mlsNumber.toString()
      })
    : ''

  const imgSrc = getCDNPath(images?.[0] ?? '', 'small')

  const startLabel = `Listed For ${type}`
  const endLabel = listingLastStatusMapping[lastStatus as ListingLastStatus]

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
                <Stack
                  spacing={2}
                  direction="row"
                  alignItems="center"
                  width="100%"
                >
                  <Stack
                    spacing={{ xs: 2, sm: 0.5 }}
                    direction={{ xs: 'row', sm: 'column' }}
                    flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                    width={{ xs: '100%', lg: '520px' }}
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

                <Stack
                  spacing={{ xs: 1, sm: 2, lg: 4 }}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-end', sm: 'center' }}
                >
                  <Typography
                    variant="body2"
                    color="text.hint"
                    textAlign="right"
                    maxWidth="80px"
                  >
                    MLS® # {mlsNumber}
                  </Typography>

                  <IconButton
                    sx={{
                      width: '80px',
                      height: '50px',
                      borderRadius: 2,
                      bgcolor: 'divider',
                      color: 'common.white',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: `url(${imgSrc})`,
                      ...(!link ? { cursor: 'default' } : {})
                    }}
                    {...(link
                      ? {
                          href: link,
                          component: 'a',
                          target: '_blank'
                        }
                      : {})}
                  >
                    <PhotoLibraryIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default HistoryItem
