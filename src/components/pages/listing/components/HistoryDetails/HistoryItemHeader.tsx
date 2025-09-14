import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Button, Stack, Typography } from '@mui/material'

import { ScrubbedDate, ScrubbedText } from 'components/atoms'

import {
  type ListingLastStatus,
  listingLastStatusMapping,
  type Property
} from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { scrubbed, sold } from 'utils/properties'
import { createPropertyI18nUtils } from 'utils/properties'

const getLastStatus = (property: Property) => {
  return listingLastStatusMapping[property.lastStatus as ListingLastStatus]
}

const HistoryItemHeader = ({
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
  const { property } = useProperty()
  const t = useTranslations()
  const { getDaysSinceListed } = createPropertyI18nUtils(t)

  const soldProperty = sold(property)
  const soldActive = soldProperty && active
  const scrubbedDate = scrubbed(startDate) || scrubbed(endDate)
  const { brokerageName } = office || {}

  const showDaysOnMarket = soldActive ? false : !scrubbedDate
  const listingStatus = soldActive
    ? getLastStatus(property)
    : active
      ? 'Active'
      : null

  let daysOnMarket = active
    ? getDaysSinceListed(property).count
    : endDate
      ? dayjs(endDate).diff(dayjs(startDate), 'day')
      : dayjs().diff(dayjs(startDate), 'day')

  if (daysOnMarket === 0) daysOnMarket = 1 // show at least one day

  // Use ICU Message Format for pluralization
  const daysOnMarketLabel = t('property.daysOnMarket', { count: daysOnMarket })

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
          Viewing now
        </Typography>
      ) : link ? (
        <Typography variant="h6" color="primary">
          <Button
            href={link}
            target="_blank"
            endIcon={<OpenInNewIcon />}
            sx={{ my: -1, mr: { xs: -2, sm: 0 }, height: '38px' }}
          >
            View
          </Button>
        </Typography>
      ) : null}
    </Stack>
  )
}

export default HistoryItemHeader
