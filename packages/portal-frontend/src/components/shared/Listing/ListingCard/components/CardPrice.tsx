import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { type ListingCardSize } from '@defaults/cards-grids'

import { ScrubbedPrice } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { createListingI18nUtils, hiddenPrice, sold } from 'utils/listings'

export const CardPrice = ({
  listing,
  size
}: {
  listing: ApiListing
  size: ListingCardSize
}) => {
  const t = useTranslations()
  const { getDaysOnMarket } = createListingI18nUtils(t)

  const { listPrice, soldPrice } = listing

  const days = getDaysOnMarket(listing)

  // shorthands
  const sizeSmall = size === 'small'
  const sizeDrawer = size === 'drawer'
  const soldListing = sold(listing)
  const hidden = hiddenPrice(listing)

  // Restricted listings arrive already masked (API scrubs listPrice to the
  // sentinel); ScrubbedPrice renders the placeholder for it.
  const price = soldListing && soldPrice ? soldPrice : listPrice

  const color = sizeDrawer ? '#FFFFFF' : 'text.primary'
  const titleHeading = sizeDrawer ? 'h2' : 'h6'
  const daysHeading = sizeDrawer ? 'body1' : 'caption'
  return (
    <Stack
      spacing={1}
      width="100%"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant={titleHeading} color={color}>
        {/* a withheld price leaves its slot empty, so the row keeps its height */}
        {hidden ? '\u00A0' : <ScrubbedPrice value={price} />}
      </Typography>
      <Typography variant={daysHeading} color={color} noWrap>
        {soldListing && soldPrice && !hidden ? (
          <>
            {!sizeSmall && <>{t('Property.listedLabel')} </>}
            <span style={{ textDecoration: 'line-through' }}>
              <ScrubbedPrice value={listPrice} />
            </span>
          </>
        ) : (
          days.label
        )}
      </Typography>
    </Stack>
  )
}
