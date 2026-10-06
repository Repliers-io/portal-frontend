import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { ScrubbedPrice } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { formatEnglishPrice, toSafeNumber } from 'utils/formatters'
import { createListingI18nUtils } from 'utils/listings'

import { PriceDifference } from '.'

export const ListPropertyPrice = ({ listing }: { listing: ApiListing }) => {
  const { listPrice, originalPrice } = listing
  const t = useTranslations()
  const { getDaysOnMarket } = createListingI18nUtils(t)

  const days = getDaysOnMarket(listing)
  const listPriceNumber = toSafeNumber(listPrice)
  const originalPriceNumber = toSafeNumber(originalPrice)

  const showOriginal =
    originalPriceNumber > 0 && listPriceNumber !== originalPriceNumber

  return (
    <Stack>
      <Stack
        spacing={1}
        direction="row"
        alignItems="flex-start"
        sx={{ maxHeight: 36 }}
      >
        <Typography noWrap variant="h2" lineHeight={1}>
          <ScrubbedPrice value={listPrice} />
        </Typography>
        {showOriginal && (
          <Typography variant="h4" sx={{ textDecoration: 'line-through' }}>
            {formatEnglishPrice(originalPrice)}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ maxHeight: 36 }}>
        <Typography color="text.hint">{days.label}</Typography>
        {showOriginal && (
          <PriceDifference
            before={originalPrice}
            after={listPrice}
            label="none"
          />
        )}
      </Stack>
    </Stack>
  )
}

export default ListPropertyPrice
