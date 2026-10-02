import { type ApiListing } from 'services/API'

import { resolveStatusGroup } from './status'

const activeSale = {
  status: 'A',
  lastStatus: 'New',
  type: 'Sale',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

const activeLease = {
  status: 'A',
  lastStatus: 'New',
  type: 'Lease',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

const sold = {
  status: 'U',
  lastStatus: 'Sld',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

const leased = {
  status: 'U',
  lastStatus: 'Lsd',
  type: 'Lease',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

// status 'U' with a lastStatus matching no sold/inactive list (e.g. 'Cs'),
// shown publicly: not active, so it must fall to sold — never sale
const closedUnclassified = {
  status: 'U',
  lastStatus: 'Cs',
  permissions: { displayPublic: 'Y' }
} as unknown as ApiListing

// real anonymous wire format for a restricted listing: status 'U' with the
// status fields scrubbed to '!scrubbed!' and permissions.displayPublic 'N'
const scrubbedRestricted = {
  status: 'U',
  lastStatus: '!scrubbed!',
  type: 'Sale',
  permissions: { displayPublic: 'N' }
} as unknown as ApiListing

const restrictedActive = {
  status: 'A',
  lastStatus: 'New',
  type: 'Sale',
  permissions: { displayPublic: 'N' }
} as unknown as ApiListing

describe('resolveStatusGroup', () => {
  it('should correctly classify an active listing for sale', () => {
    expect(resolveStatusGroup(activeSale)).toBe('sale')
  })

  it('should correctly classify an active lease as rent', () => {
    expect(resolveStatusGroup(activeLease)).toBe('rent')
  })

  it('should correctly classify a sold listing as sold', () => {
    expect(resolveStatusGroup(sold)).toBe('sold')
  })

  it('should correctly classify a leased listing as sold', () => {
    expect(resolveStatusGroup(leased)).toBe('sold')
  })

  it('should correctly classify off-market listings as inactive', () => {
    const offMarket = (lastStatus: string) =>
      ({
        status: 'U',
        lastStatus,
        permissions: { displayPublic: 'Y' }
      }) as unknown as ApiListing

    expect(resolveStatusGroup(offMarket('Sus'))).toBe('inactive')
    expect(resolveStatusGroup(offMarket('Exp'))).toBe('inactive')
    expect(resolveStatusGroup(offMarket('Ter'))).toBe('inactive')
  })

  it('should correctly classify a non-active listing with an unrecognized status as sold, never sale', () => {
    expect(resolveStatusGroup(closedUnclassified)).toBe('sold')
  })

  it('should classify a scrubbed restricted listing as sold for anonymous users', () => {
    expect(resolveStatusGroup(scrubbedRestricted, false)).toBe('sold')
  })

  it('should hide a restricted listing as sold for anonymous users', () => {
    expect(resolveStatusGroup(restrictedActive, false)).toBe('sold')
  })

  it('should reveal the real status of a restricted listing for logged-in users', () => {
    expect(resolveStatusGroup(restrictedActive, true)).toBe('sale')
  })

  it('should not hide a public listing from anonymous users', () => {
    expect(resolveStatusGroup(activeSale, false)).toBe('sale')
  })
})
