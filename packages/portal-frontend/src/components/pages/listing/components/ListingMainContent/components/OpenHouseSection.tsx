import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import { Divider, Stack, Typography } from '@mui/material'

import features from '@configs/features'
import { DetailsContainer } from '@shared/Containers'

import { useListing } from 'providers/ListingProvider'
import { formatTimeSlot, upcomingOpenHouses } from 'utils/listings'

export const OpenHouseSection = () => {
  const t = useTranslations()
  const { listing } = useListing()

  if (!features.openHouse) return null

  const openHouses = upcomingOpenHouses(listing).slice(0, 3)

  if (!openHouses.length) return null

  const oneItem = openHouses.length === 1

  return (
    <DetailsContainer id="open-houses">
      <Stack
        width="100%"
        spacing={{ xs: 2, sm: 4 }}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography
          sx={{
            my: { xs: 0, sm: -1 },
            typography: { xs: 'h4', sm: 'h3' },
            maxWidth: { xs: 'auto', sm: oneItem ? 'auto' : '100px' }
          }}
        >
          {t('PDP.sections.openHouse.name')}
        </Typography>

        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ mx: 1 }} />}
          sx={{
            flex: 1,
            my: { xs: 0, sm: -1 },
            width: { xs: '100%', sm: 'auto' }
          }}
          alignItems="flex-start"
        >
          {openHouses.map((oh, index) => (
            <Stack
              key={index}
              alignItems="center"
              justifyContent="center"
              spacing={oneItem ? 2 : 0}
              direction={oneItem ? 'row' : 'column'}
              sx={{ flex: 1, alignSelf: 'stretch' }}
            >
              <Typography variant="h5">
                {dayjs(oh.date).format('dddd')}
              </Typography>
              <Typography variant="body2" color="text.hint" align="center">
                {dayjs(oh.date).format('MMMM D, YYYY')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  pt: oneItem ? 0 : 0.5,
                  flex: oneItem ? 'none' : 1,
                  display: 'flex',
                  alignItems: 'flex-end'
                }}
              >
                {formatTimeSlot(oh.startTime, oh.endTime)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </DetailsContainer>
  )
}
