import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { ScrubbedDate, ScrubbedPrice } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { rent, soldDate } from 'utils/listings'

export const ListedPropertyPrice = ({ listing }: { listing: ApiListing }) => {
  const t = useTranslations('Property')
  const { listPrice } = listing
  const listingSoldDate = soldDate(listing)

  return (
    <Stack>
      <Typography variant="h2" lineHeight={1}>
        <span>{t('listedLabel')} </span>
        <span style={{ textDecoration: 'line-through' }}>
          <ScrubbedPrice value={listPrice} />
        </span>
      </Typography>
      {listingSoldDate && (
        <Typography
          color="text.hint"
          sx={{
            width: { xs: 'auto', sm: '100%', lg: 'auto' }
          }}
        >
          {t(rent(listing) ? 'leasedDateLabel' : 'soldDateLabel')}{' '}
          <ScrubbedDate value={listingSoldDate} />
        </Typography>
      )}
    </Stack>
  )
}
