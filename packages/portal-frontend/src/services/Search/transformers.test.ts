import defaultFilters from '../../configs/defaults/filters'
import urbnFilters from '../../configs/urbn/filters'

import { buildDeclarationQuery } from './transformers'

const urbnMap = {
  active: { type: 'sale', standardStatus: ['Active'] },
  pending: {
    type: 'sale',
    standardStatus: ['Pending', 'Active Under Contract']
  },
  sold: { type: 'sale', standardStatus: ['Closed'] },
  rent: { type: 'lease', standardStatus: ['Active'] }
}

describe('buildDeclarationQuery', () => {
  it('maps a single status to its fragment', () => {
    expect(buildDeclarationQuery('active', urbnMap)).toEqual({
      type: 'sale',
      standardStatus: ['Active']
    })
  })

  it('unions standardStatus across selected sale statuses, keeping type scalar', () => {
    expect(buildDeclarationQuery(['active', 'sold'], urbnMap)).toEqual({
      type: 'sale',
      standardStatus: ['Active', 'Closed']
    })
  })

  it('de-duplicates overlapping standardStatus values', () => {
    expect(buildDeclarationQuery(['pending', 'active'], urbnMap)).toEqual({
      type: 'sale',
      standardStatus: ['Pending', 'Active Under Contract', 'Active']
    })
  })

  it('maps rentals to a lease query', () => {
    expect(buildDeclarationQuery('rent', urbnMap)).toEqual({
      type: 'lease',
      standardStatus: ['Active']
    })
  })

  it('ignores unknown status keys', () => {
    expect(buildDeclarationQuery(['active', 'nope'] as never, urbnMap)).toEqual(
      {
        type: 'sale',
        standardStatus: ['Active']
      }
    )
  })
})

describe('URBN listingStatusDeclaration', () => {
  const map = urbnFilters.listingStatusDeclaration as Record<
    string,
    Record<string, unknown>
  >

  it('has the four URBN options mapped to sale/lease + standardStatus', () => {
    expect(map.active).toEqual({ type: 'sale', standardStatus: ['Active'] })
    expect(map.pending).toEqual({
      type: 'sale',
      standardStatus: ['Pending', 'Active Under Contract']
    })
    expect(map.sold).toEqual({ type: 'sale', standardStatus: ['Closed'] })
    expect(map.rent).toEqual({
      type: 'lease',
      propertyType: ['Rental'],
      standardStatus: ['Active']
    })
  })

  it('carries the rental propertyType no listing-type button contributes', () => {
    const buttonTypes = Object.values(urbnFilters.listingTypeDeclaration)
      .flatMap((entry) => (entry?.propertyType as string[]) ?? [])
      .flat()

    expect(buttonTypes).not.toContain('Rental')
    expect(map.rent.propertyType).toEqual(['Rental'])
  })
})

describe('default statusFilters', () => {
  it('carries the legacy vocabulary, byte-matching the previously hardcoded dialects', () => {
    expect(defaultFilters.statusFilters).toEqual({
      active: {
        status: 'A',
        lastStatus: ['New', 'Pc', 'Sc', 'Sce', 'Cs', 'Ext', 'Lc']
      },
      activeRange: { status: 'A', lastStatus: ['New', 'Sc', 'Pc'] },
      sold: { status: 'U', lastStatus: ['Sld', 'Sc', 'Sce'] },
      leased: { status: 'U', lastStatus: ['Lsd'] },
      unavailable: { status: 'U' },
      any: { status: ['A', 'U'] },
      cancelled: { status: 'U', lastStatus: ['Ter', 'Exp', 'Sus', 'Dft'] }
    })
  })
})

describe('URBN statusFilters', () => {
  it('speaks standardStatus only — no legacy params in any fragment', () => {
    Object.values(urbnFilters.statusFilters).forEach((fragment) => {
      expect(fragment).not.toHaveProperty('status')
      expect(fragment).not.toHaveProperty('lastStatus')
    })
  })

  it('maps every key to its RESO equivalent', () => {
    expect(urbnFilters.statusFilters).toEqual({
      active: { standardStatus: ['Active'] },
      activeRange: { standardStatus: ['Active'] },
      sold: { standardStatus: ['Closed'] },
      leased: { standardStatus: ['Closed'] },
      unavailable: { standardStatus: ['Closed'] },
      any: {},
      cancelled: { standardStatus: ['Canceled', 'Expired', 'Withdrawn'] }
    })
  })
})
