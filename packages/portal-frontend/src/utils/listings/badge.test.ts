import { type ApiListing } from 'services/API'

jest.mock('@configs/badgeSurfaces', () => ({
  badgeSurfaces: { map: ['sold', 'inactive'], gallery: [] }
}))
jest.mock('@configs/features', () => ({
  __esModule: true,
  default: { blurRestrictedProperty: false }
}))
jest.mock('@configs/listings', () => ({
  __esModule: true,
  default: {
    statusLabels: { Sld: 'Sold', Sc: 'Sold Conditionally', Ter: 'Terminated' },
    scrubbed: { data: '!scrubbed!', date: '1900-06-21T01:39:00.000Z' }
  }
}))

import {
  type BadgeGroup,
  offMarketLabel,
  resolveBadge,
  resolveBadgeLabel
} from './badge'

const listing = (o: Record<string, unknown>): ApiListing =>
  ({ permissions: { displayPublic: 'Y' }, ...o }) as unknown as ApiListing

describe('resolveBadge', () => {
  it('badges a genuinely sold listing on a sold surface', () => {
    expect(
      resolveBadge(listing({ status: 'U', lastStatus: 'Sld' }), 'map')
    ).toBe('sold')
  })

  it('badges a conditional sale as pending, never as sold', () => {
    expect(
      resolveBadge(listing({ status: 'U', lastStatus: 'Sc' }), 'map')
    ).toBe('pending')
  })

  it('treats an active conditional (status A) as pending too', () => {
    expect(
      resolveBadge(listing({ status: 'A', lastStatus: 'Sc' }), 'map')
    ).toBe('pending')
  })

  it('badges a scrubbed off-market listing with the umbrella, never "sold"', () => {
    expect(
      resolveBadge(
        listing({
          status: 'U',
          lastStatus: '!scrubbed!',
          permissions: { displayPublic: 'N' }
        }),
        'map',
        false
      )
    ).toBe('offMarket')
  })

  it('never falsely badges a restricted-but-active listing as sold', () => {
    expect(
      resolveBadge(
        listing({
          status: 'A',
          lastStatus: 'New',
          permissions: { displayPublic: 'N' }
        }),
        'map',
        false
      )
    ).toBeNull()
  })

  it('shows no badge on a surface with an empty group list', () => {
    expect(
      resolveBadge(listing({ status: 'U', lastStatus: 'Sld' }), 'gallery')
    ).toBeNull()
  })

  it('shows no badge without a surface', () => {
    expect(
      resolveBadge(listing({ status: 'U', lastStatus: 'Sld' }), null)
    ).toBeNull()
  })
})

describe('resolveBadgeLabel', () => {
  const labels: Record<BadgeGroup, string> = {
    sale: 'For sale',
    rent: 'For rent',
    sold: 'Sold',
    inactive: 'Inactive',
    pending: 'Pending',
    offMarket: 'Off Market'
  }
  const t = (group: BadgeGroup) => labels[group]

  it('reads the pending label from i18n, not the raw MLS status', () => {
    expect(
      resolveBadgeLabel(
        'pending',
        listing({ status: 'U', lastStatus: 'Sc' }),
        t
      )
    ).toBe('Pending')
  })

  it('reads the off-market umbrella label from i18n', () => {
    expect(
      resolveBadgeLabel(
        'offMarket',
        listing({ status: 'U', lastStatus: '!scrubbed!' }),
        t
      )
    ).toBe('Off Market')
  })

  it('prefers the precise MLS status label for a genuinely sold listing', () => {
    expect(
      resolveBadgeLabel('sold', listing({ status: 'U', lastStatus: 'Sld' }), t)
    ).toBe('Sold')
  })

  it('falls back to the i18n group label when lastStatus has no MLS label', () => {
    expect(
      resolveBadgeLabel(
        'inactive',
        listing({ status: 'U', lastStatus: 'Ext' }),
        t
      )
    ).toBe('Inactive')
  })
})

describe('offMarketLabel', () => {
  const labels: Record<BadgeGroup, string> = {
    sale: 'For sale',
    rent: 'For rent',
    sold: 'Sold',
    inactive: 'Inactive',
    pending: 'Pending',
    offMarket: 'Off Market'
  }
  const t = (group: BadgeGroup) => labels[group]

  it('shows the precise MLS status when it survived scrubbing', () => {
    expect(offMarketLabel(listing({ status: 'U', lastStatus: 'Ter' }), t)).toBe(
      'Terminated'
    )
  })

  it('shows the "Off Market" umbrella when the status is scrubbed', () => {
    expect(
      offMarketLabel(listing({ status: 'U', lastStatus: '!scrubbed!' }), t)
    ).toBe('Off Market')
  })
})
