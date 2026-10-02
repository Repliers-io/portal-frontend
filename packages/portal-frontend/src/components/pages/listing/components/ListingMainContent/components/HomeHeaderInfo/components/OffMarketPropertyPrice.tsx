import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { type ApiListing } from 'services/API'
import { offMarketLabel, scrubbed } from 'utils/listings'

// Header price block for an off-market listing (terminated/expired/suspended, or
// one whose status is redacted for guests). Shows the honest status label plus
// the last asking price — never a fabricated "Sold:" or a sold-price skeleton.
export const OffMarketPropertyPrice = ({
  listing
}: {
  listing: ApiListing
}) => {
  const t = useTranslations('Listing.status')

  if (scrubbed(listing.lastStatus)) return null

  return (
    <Stack>
      <Typography variant="h2" lineHeight={1}>
        {offMarketLabel(listing, t)}
      </Typography>
    </Stack>
  )
}
