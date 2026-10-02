import { markerColors } from '@configs/colors'

import { type ApiListing } from 'services/API'

import { resolveListingMarkerColor } from './markers'

// active listing whose price is restricted for guests (displayPublic 'N').
// It is NOT sold — status stays 'A' even when the price is scrubbed.
const restrictedActive = {
  status: 'A',
  lastStatus: 'New',
  type: 'Sale',
  permissions: { displayPublic: 'N' }
} as unknown as ApiListing

const sold = {
  status: 'U',
  lastStatus: 'Sld',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

describe('resolveListingMarkerColor', () => {
  it('colours a price-restricted active listing by its true status, not sold', () => {
    const { color } = resolveListingMarkerColor({ listing: restrictedActive })
    expect(color).toBe(markerColors.default.color)
    expect(color).not.toBe(markerColors.sold.color)
  })

  it('colours a genuinely sold listing with the sold variant', () => {
    const { color } = resolveListingMarkerColor({ listing: sold })
    expect(color).toBe(markerColors.sold.color)
  })
})
