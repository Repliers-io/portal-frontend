import { TYPE_RENTAL } from '@configs/filter-types'

import { flattenFilterArrays, mergeFilters, transformFilters } from './adapter'

describe('SearchService/adapter', () => {
  describe('transformFilters', () => {
    it('should transform the filters using transformers', () => {
      const keys = ['listingStatus', 'minBeds', 'maxPrice', 'minPrice']
      const params = {
        listingStatus: ['active', 'BROKEN_VALUE', 'rent'],
        minBeds: -1,
        minPrice: 0,
        maxPrice: 500_000
      }

      const result = transformFilters(keys, params)

      // order of items matches the order of keys
      expect(result).toEqual([
        {
          type: 'lease',
          status: 'A',
          propertyType: TYPE_RENTAL,
          lastStatus: ['New', 'Sc', 'New', 'Sc']
        },
        {
          minBeds: 1
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

  // describe('processParams', () => {
  //   it('should process params and return the expected result', () => {
  //     const params: ApiQueryParams = {
  //       simpleKey: 'value1',
  //       optionalKey: 'value2',
  //       otherKey: 'value3'
  //     }

  //     const result = processParams(params)

  //     expect(result).toEqual({
  //       /* expected processed params */
  //     })
  //   })
  // })
})
