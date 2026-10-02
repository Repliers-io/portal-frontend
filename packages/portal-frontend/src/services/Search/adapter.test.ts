import { type ApiQueryParams, type RawQuery } from 'services/API'
import { rawSelection } from 'utils/filters'

import {
  applyListingTypeUnion,
  applySoldPriceAndDate,
  flattenFilterArrays,
  getListingType,
  listingTypeQueryGroups,
  mergeFilters,
  processParams,
  transformFilters
} from './adapter'
import { listingTypeDeclaration } from './listingTypeDeclaration'
import { type TransactionType } from './types'

describe('SearchService/adapter', () => {
  describe('transformFilters', () => {
    it('should merge sold and active listingStatus into combined params', () => {
      const keys = ['listingStatus']
      const params = {
        listingStatus: ['sold', 'active']
      } as unknown as Partial<ApiQueryParams>

      const result = transformFilters(keys, params)

      expect(result).toEqual([
        {
          type: 'sale',
          status: ['U', 'A'],
          lastStatus: ['Sld', 'Sc', 'Sce', 'New', 'Pc', 'Cs', 'Ext', 'Lc']
        }
      ])
    })

    it('should transform the filters using transformers', () => {
      const keys = ['listingStatus', 'minBedrooms', 'maxPrice', 'minPrice']
      const params = {
        listingStatus: ['active', 'BROKEN_VALUE', 'rent'],
        minBedrooms: -1,
        minPrice: 0,
        maxPrice: 500_000
      }

      const result = transformFilters(keys, params)

      // order of items matches the order of keys
      expect(result).toEqual([
        {
          type: ['sale', 'lease'],
          status: 'A',
          propertyType: ['Residential Lease'],
          lastStatus: ['New', 'Pc', 'Sc', 'Sce', 'Cs', 'Ext', 'Lc']
        },
        {
          minBedrooms: 1
        },
        {
          maxPrice: 500000
        },
        {
          minPrice: 1
        }
      ])
    })
  })

  describe('soldRange', () => {
    const soldRange2024 = (type?: TransactionType) =>
      transformFilters(['soldRange'], {
        soldRange: '2024',
        ...(type ? { type } : {})
      } as unknown as Partial<ApiQueryParams>)[0]

    it('should emit Leased (Lsd) when type is lease', () => {
      expect(soldRange2024('lease')).toEqual({
        minSoldDate: '2024-01-01',
        maxSoldDate: '2024-12-31',
        status: 'U',
        lastStatus: ['Lsd']
      })
    })

    it('should emit Sold (Sld) when type is sale', () => {
      expect(soldRange2024('sale')).toMatchObject({
        lastStatus: ['Sld', 'Sc', 'Sce']
      })
    })

    it('should fall back to Sold (Sld) when type is unset (backward compatible)', () => {
      expect(soldRange2024()).toMatchObject({
        lastStatus: ['Sld', 'Sc', 'Sce']
      })
    })
  })

  describe('activeRange', () => {
    it('emits a listDate bound plus the activeRange status fragment', () => {
      expect(
        transformFilters(['activeRange'], {
          activeRange: 'lastWeek'
        } as unknown as Partial<ApiQueryParams>)[0]
      ).toEqual({
        minListDate: expect.any(String),
        status: 'A',
        lastStatus: ['New', 'Sc', 'Pc']
      })
    })
  })

  describe('cancelledRange', () => {
    it('emits unavailable-date bounds plus the cancelled lastStatuses', () => {
      expect(
        transformFilters(['cancelledRange'], {
          cancelledRange: '2024'
        } as unknown as Partial<ApiQueryParams>)[0]
      ).toEqual({
        status: 'U',
        minUnavailableDate: '2024-01-01',
        maxUnavailableDate: '2024-12-31',
        lastStatus: ['Ter', 'Exp', 'Sus', 'Dft']
      })
    })
  })

  describe('mergeFilters', () => {
    it('should merge multiple filter objects into one', () => {
      const filtersArray = [
        { key1: 'value1', key2: 'value2' },
        { key1: 'value3', key3: ['value4', 'value5'] },
        { key3: 'value4' }
      ] as Record<string, string>[]

      const result = mergeFilters(filtersArray)

      expect(result).toEqual({
        key1: ['value1', 'value3'],
        key2: 'value2',
        key3: [['value4', 'value5'], 'value4']
      })
    })
  })

  describe('flattenFilterArrays', () => {
    it('should flatten nested arrays and remove duplicates', () => {
      const filters = {
        key1: [[['value1']], 'value2', 'value1'],
        key2: ['value3', ['value4', ['value5', 'value3']]],
        key3: 'value6'
      }

      const result = flattenFilterArrays(filters)

      expect(result).toEqual({
        key1: ['value1', 'value2'],
        key2: ['value3', 'value4', 'value5'],
        key3: 'value6'
      })
    })
  })

  describe('processParams — queries passthrough', () => {
    it('routes queries into the POST group untouched', () => {
      const queries: RawQuery[] = [
        { agentId: 'X' },
        { 'raw.BuyerAgentKey': 'X' }
      ]

      const result = processParams({ status: 'U', queries })

      expect(result.post.queries).toEqual(queries)
      expect(result.get.queries).toBeUndefined()
      expect(result.get.status).toBe('U')
    })

    it('produces an empty POST group when no queries are present', () => {
      const result = processParams({ status: 'U' })

      expect(result.post).toEqual({})
      expect(result.get.status).toBe('U')
    })

    it('sends a raw field selection as a repeated GET parameter', () => {
      const result = processParams({
        ...rawSelection('View', ['lake', 'river'])
      })

      expect(result.get['raw.View']).toEqual(['lake', 'river'])
      expect(result.post).toEqual({})
    })
  })

  describe('processParams — range filters own the status axis', () => {
    it('drops the listingStatus status axis when soldRange is set', () => {
      const result = processParams({
        listingStatus: 'active',
        soldRange: '2024'
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.status).toBe('U')
      expect(result.get.lastStatus).toEqual(['Sc', 'Sce', 'Sld'])
      // the type axis listingStatus also carries must survive
      expect(result.get.type).toBe('sale')
    })

    it('drops the listingStatus status axis when activeRange is set', () => {
      const result = processParams({
        listingStatus: 'sold',
        activeRange: 'last30d'
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.status).toBe('A')
      expect(result.get.lastStatus).toEqual(['New', 'Pc', 'Sc'])
    })

    it('leaves listingStatus alone when no range filter is set', () => {
      const result = processParams({
        listingStatus: 'active'
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.status).toBe('A')
    })

    it('keeps the listingStatus status axis when the ranges are empty (advanced dialog defaults)', () => {
      const result = processParams({
        listingStatus: 'sold',
        soldRange: '',
        activeRange: ''
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.status).toBe('U')
      expect(result.get.lastStatus).toEqual(['Sc', 'Sce', 'Sld'])
    })
  })

  describe('applySoldPriceAndDate', () => {
    it('bounds sold results by the sold price and orders them by sale date', () => {
      const params = applySoldPriceAndDate({
        minPrice: 500_000,
        maxPrice: 900_000,
        sortBy: 'createdOnDesc'
      })

      expect(params).not.toHaveProperty('minPrice')
      expect(params).not.toHaveProperty('maxPrice')
      expect(params.minSoldPrice).toBe('500000')
      expect(params.maxSoldPrice).toBe('900000')
      expect(params.sortBy).toBe('soldDateDesc')
    })
  })

  describe('processParams — imagesOrder', () => {
    it('keeps the MLS image order for either AI parameter', () => {
      const text = processParams({
        imageSearchItems: [{ type: 'text', value: 'kitchen', boost: 1 }]
      } as Partial<ApiQueryParams>)
      const space = processParams({
        coverImage: 'kitchen'
      } as unknown as Partial<ApiQueryParams>)

      expect(text.get.imagesOrder).toBe('original')
      expect(space.get.imagesOrder).toBe('original')
    })

    // The trap: Repliers answers a 400 to `imagesOrder` without one of them.
    it('leaves a plain search without it', () => {
      expect(processParams({ status: 'A' }).get).not.toHaveProperty(
        'imagesOrder'
      )
    })
  })

  describe('processParams — radius', () => {
    it('passes a fractional radius through unchanged (Repliers accepts floats)', () => {
      const result = processParams({
        lat: '47.70306',
        long: '-122.32806',
        radius: 1.6
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.radius).toBe(1.6)
    })

    it('coerces a string radius from a CMS/widget shortcode to a number', () => {
      const result = processParams({
        radius: '1.6'
      } as unknown as Partial<ApiQueryParams>)

      expect(result.get.radius).toBe(1.6)
    })

    it('leaves a whole radius untouched', () => {
      const result = processParams({ radius: 5 } as Partial<ApiQueryParams>)

      expect(result.get.radius).toBe(5)
    })
  })

  describe('listingTypeQueryGroups', () => {
    it('returns one RawQuery per selected type', () => {
      const groups = listingTypeQueryGroups(['residential', 'condo'])

      expect(groups).toHaveLength(2)
      // Both `residential` and `condo` are propertyType-driven in every tenant.
      groups.forEach((group) => expect(group.propertyType).toBeDefined())
    })

    it('never emits empty arrays or blank values (a type that adds no constraint is dropped)', () => {
      const groups = listingTypeQueryGroups([
        'residential',
        'condo',
        'townhome',
        'semiDetached'
      ])

      groups.forEach((group) => {
        expect(Object.keys(group).length).toBeGreaterThan(0)
        Object.values(group).forEach((value) => {
          if (Array.isArray(value)) expect(value.length).toBeGreaterThan(0)
          else expect(value).not.toBe('')
        })
      })
    })

    it('accepts a single type as a scalar', () => {
      expect(listingTypeQueryGroups('residential')).toHaveLength(1)
    })
  })

  describe('getListingType', () => {
    it('returns undefined for empty or unknown propertyTypes', () => {
      expect(getListingType([])).toBeUndefined()
      expect(getListingType(['__not_a_real_property_type__'])).toBeUndefined()
    })

    it('reverse-maps a full propertyType set back to its type key', () => {
      const allProps =
        (listingTypeDeclaration.allListings?.propertyType as string[]) ?? []
      expect(getListingType(allProps)).toBe('allListings')
    })
  })

  describe('applyListingTypeUnion', () => {
    it('writes the type groups straight into queries when none pre-exist', () => {
      const params: Partial<ApiQueryParams> = { status: 'A' }
      const groups: RawQuery[] = [
        { propertyType: ['Single Family Residence'] },
        { style: ['Townhouse'] }
      ]

      applyListingTypeUnion(params, groups)

      expect(params.queries).toEqual(groups)
      expect(params.status).toBe('A')
    })

    it('folds an explicit top-level class/propertyType/style into every branch and drops it from the top level', () => {
      const params = {
        class: 'residential',
        style: ['2-Storey']
      } as unknown as Partial<ApiQueryParams>
      const groups: RawQuery[] = [
        { propertyType: ['Single Family Residence'] },
        { propertyType: ['Condominium'] }
      ]

      applyListingTypeUnion(params, groups)

      expect(params.class).toBeUndefined()
      expect(params.style).toBeUndefined()
      expect(params.queries).toEqual([
        {
          class: 'residential',
          style: ['2-Storey'],
          propertyType: ['Single Family Residence']
        },
        {
          class: 'residential',
          style: ['2-Storey'],
          propertyType: ['Condominium']
        }
      ])
    })

    it('cartesian-combines the type union with a pre-existing query union (overlay polygons)', () => {
      const params: Partial<ApiQueryParams> = {
        queries: [{ locationId: ['LOC1'] }, { map: [[[0, 0]]] } as RawQuery]
      }
      const groups: RawQuery[] = [
        { propertyType: ['Single Family Residence'] },
        { style: ['Townhouse'] }
      ]

      applyListingTypeUnion(params, groups)

      // (O1 ∨ O2) ∧ (T1 ∨ T2) → 4 AND-merged branches
      expect(params.queries).toEqual([
        { locationId: ['LOC1'], propertyType: ['Single Family Residence'] },
        { locationId: ['LOC1'], style: ['Townhouse'] },
        { map: [[[0, 0]]], propertyType: ['Single Family Residence'] },
        { map: [[[0, 0]]], style: ['Townhouse'] }
      ])
    })
  })
})
