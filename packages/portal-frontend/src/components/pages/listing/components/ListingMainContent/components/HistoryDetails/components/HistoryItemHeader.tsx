import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import { OpenInNewIcon } from '@configs/icons'
import listingsConfig from '@configs/listings'

import { ScrubbedDate, ScrubbedText } from 'components/atoms'

import { useListing } from 'providers/ListingProvider'
import {
  createListingI18nUtils,
  lastStatusLabel,
  scrubbed,
  sold
} from 'utils/listings'

export const HistoryItemHeader = ({
  link,
  active,
  endDate,
  startDate,
  office
}: {
  link: string
  active: boolean
  endDate: string
  startDate: string
  office?: { brokerageName?: string }
}) => {
  const { listing } = useListing()
  const t = useTranslations()
  const { getDaysSinceListed } = createListingI18nUtils(t)

  const soldListing = sold(listing)
  const soldActive = soldListing && active
  const scrubbedDate = scrubbed(startDate) || scrubbed(endDate)
  const { brokerageName } = office || {}
  const newTab = listingsConfig.linksInNewTab

  const showDaysOnMarket = soldActive ? false : !scrubbedDate
  const listingStatus = soldActive
    ? lastStatusLabel(listing.lastStatus)
    : active
      ? 'Active'
      : null

  let daysOnMarket = active
    ? getDaysSinceListed(listing).count
    : endDate
      ? dayjs(endDate).diff(dayjs(startDate), 'day')
      : dayjs().diff(dayjs(startDate), 'day')

  if (daysOnMarket === 0) daysOnMarket = 1 // show at least one day

  // Use ICU Message Format for pluralization
  const daysOnMarketLabel = t('Property.daysOnMarket', { count: daysOnMarket })

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="flex-end"
      justifyContent="space-between"
    >
      <Stack spacing={1}>
        <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
          <Typography
            variant="h5"
            sx={{
              color: { xs: active ? 'secondary.main' : '', md: 'common.black' }
            }}
          >
            {listingStatus || <ScrubbedDate value={startDate} />}
          </Typography>
          {showDaysOnMarket && (
            <Typography color="text.hint" variant="body2">
              ({daysOnMarketLabel})
            </Typography>
          )}
        </Stack>
        {brokerageName && (
          <Typography variant="body2" fontWeight={600} color="primary.main">
            <ScrubbedText replace="Brokerage Name">
              {brokerageName}
            </ScrubbedText>
          </Typography>
        )}
      </Stack>
      {active ? (
        <Typography
          minWidth={104}
          color="text.hint"
          textAlign="right"
          px={{ xs: 0, sm: 2 }}
        >
          {t('PDP.currentHistoryItem')}
        </Typography>
      ) : link ? (
        <Typography variant="h6" color="primary">
          <Button
            href={link}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            endIcon={<OpenInNewIcon />}
            sx={{ my: -1, mr: { xs: -2, sm: 0 }, height: '38px' }}
          >
            {t('PDP.openHistoryItem')}
          </Button>
        </Typography>
      ) : null}
    </Stack>
  )
}
