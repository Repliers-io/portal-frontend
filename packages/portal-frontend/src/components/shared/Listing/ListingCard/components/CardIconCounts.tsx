import { Divider, Stack, Typography } from '@mui/material'

import { BathIcon, BedIcon, SquareIcon } from '@configs/icons'
import { type ListingCardSize } from '@defaults/cards-grids'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import {
  getBathrooms,
  getBedrooms,
  getLotSize,
  getSqft,
  land,
  scrubbed
} from 'utils/listings'
import { toRem } from 'utils/theme'

export const CardIconCounts = ({
  listing,
  size
}: {
  listing: ApiListing
  size: ListingCardSize
}) => {
  const { details } = listing

  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const sqft = getSqft(listing, 'ft²')
  const lotSize = getLotSize(listing)

  // Restricted numeric fields arrive as the scrubbed sentinel; render a
  // placeholder for those. A genuine 0 (e.g. a studio) is not the sentinel, so it
  // still collapses to nothing instead of a fake placeholder.
  const bedsScrubbed = scrubbed(details?.numBedrooms)
  const bathsScrubbed = scrubbed(details?.numBathrooms)
  const sqftScrubbed = scrubbed(details?.sqft)

  // Beds/baths/sqft fill up to three slots in this row; the narrow small/medium
  // cards can't fit a fourth, so lot size — the lowest-priority field — is
  // dropped once those three are present. Large/wide/drawer cards always show it.
  const compactRow = size === 'small' || size === 'medium'
  const filledSlots = [
    bedsScrubbed || beds.count,
    bathsScrubbed || baths.count,
    sqftScrubbed || sqft.number
  ].filter(Boolean).length
  const showLotSize =
    land(listing) && lotSize.number && (!compactRow || filledSlots < 3)

  // shorthands
  const sizeMap = size === 'small'
  const sizeDrawer = size === 'drawer'
  const color = sizeDrawer ? '#FFFFFF' : 'text.primary'
  const fontSize = toRem(sizeMap ? 11 : sizeDrawer ? 18 : 14)
  const lineHeight = toRem(sizeMap ? 18 : 20)

  return (
    <Typography
      component="div"
      color={color}
      fontWeight={500}
      fontSize={fontSize}
      lineHeight={lineHeight}
    >
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        divider={<Divider flexItem variant="middle" orientation="vertical" />}
      >
        {bedsScrubbed ? (
          <ScrubbedText replace="beds" />
        ) : beds.count ? (
          <>
            <BedIcon size={16} color={color} /> {beds.label}
          </>
        ) : null}

        {bathsScrubbed ? (
          <ScrubbedText replace="bath" />
        ) : baths.count ? (
          <>
            <BathIcon size={16} color={color} /> {baths.label}
          </>
        ) : null}

        {sqftScrubbed ? (
          <ScrubbedText replace="square ft" />
        ) : sqft.number ? (
          <>
            <SquareIcon size={13} color={color} />{' '}
            <span style={{ whiteSpace: 'nowrap' }}>{sqft.label}</span>
          </>
        ) : null}

        {showLotSize && (
          <>
            <SquareIcon size={13} color={color} />{' '}
            <span style={{ whiteSpace: 'nowrap' }}>{lotSize.label}</span>
          </>
        )}
      </Stack>
    </Typography>
  )
}
