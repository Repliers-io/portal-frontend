import {
  convertApiValueType,
  mergeRepeatedProperties,
  splitCommaValues
} from './utils'

describe('EstimateProvider utils', () => {
  describe('convertApiValueType', () => {
    describe('Primitive Types', () => {
      it('should convert string to number when form expects a number', () => {
        const formValue = 0
        const apiValue = '42'
        expect(convertApiValueType(formValue, apiValue)).toBe(42)
      })

      it('should round the number if form expects an integer', () => {
        const formValue = 0
        const apiValue = '3.7'
        expect(convertApiValueType(formValue, apiValue)).toBe(4)
      })

      it('should return original value if conversion to number fails', () => {
        const formValue = 0
        const apiValue = 'not-a-number'
        expect(convertApiValueType(formValue, apiValue)).toBe('not-a-number')
      })

      it('should convert number to string when form expects a string', () => {
        const formValue = ''
        const apiValue = 100
        expect(convertApiValueType(formValue, apiValue)).toBe('100')
      })

      it('should convert various types to boolean', () => {
        expect(convertApiValueType(true, 'true')).toBe(true)
        expect(convertApiValueType(false, 0)).toBe(false)
        expect(convertApiValueType(false, 'anything')).toBe(true)
      })
    })

    describe('Objects', () => {
      it('should recursively convert nested objects', () => {
        const formValue = {
          details: {
            numBedrooms: 0,
            numBathrooms: 0
          }
        }
        const apiValue = {
          details: {
            numBedrooms: '3.0',
            numBathrooms: '2.0'
          }
        }
        const expected = {
          details: {
            numBedrooms: 3,
            numBathrooms: 2
          }
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })

      it('should handle null values correctly', () => {
        const formValue = null
        const apiValue = { any: 'value' }
        expect(convertApiValueType(formValue, apiValue)).toEqual({
          any: 'value'
        })
      })

      it('should skip properties not present in apiValue', () => {
        const formValue = {
          user: {
            name: '',
            age: 0
          }
        }
        const apiValue = {
          user: {
            name: 'Alice'
          }
        }
        const expected = {
          user: {
            name: 'Alice'
          }
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })

      it('should handle deeply nested objects', () => {
        const formValue = {
          level1: {
            level2: {
              level3: {
                count: 0
              }
            }
          }
        }
        const apiValue = {
          level1: {
            level2: {
              level3: {
                count: '5.0'
              }
            }
          }
        }
        const expected = {
          level1: {
            level2: {
              level3: {
                count: 5
              }
            }
          }
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })
    })

    describe('Arrays', () => {
      it('should convert array elements based on form array item type', () => {
        const formValue = {
          amenities: ['']
        }
        const apiValue = {
          amenities: [1, 2, 3]
        }
        const expected = {
          amenities: ['1', '2', '3']
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })

      it('should handle arrays of objects', () => {
        const formValue = {
          users: [{ age: 0 }]
        }
        const apiValue = {
          users: [{ age: '25.0' }, { age: '30.0' }]
        }
        const expected = {
          users: [{ age: 25 }, { age: 30 }]
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })

      it('should return original array if form array is empty', () => {
        const formValue = {
          tags: []
        }
        const apiValue = {
          tags: ['tag1', 'tag2']
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual({
          tags: ['tag1', 'tag2']
        })
      })

      it('should return api array as-is if form array has no sample elements', () => {
        const formValue = {
          items: []
        }
        const apiValue = {
          items: [{ id: '1' }, { id: '2' }]
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual({
          items: [{ id: '1' }, { id: '2' }]
        })
      })

      it('should handle mixed type arrays correctly and convert items to the type of the first element (if possible)', () => {
        const formValue = {
          mixed: [0]
        }
        const apiValue = {
          mixed: ['1', 'true', '4h', '3.14']
        }
        const expected = {
          mixed: [1, 'true', '4h', 3]
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })
    })

    describe('Edge Cases', () => {
      it('should return apiValue if formValue is undefined', () => {
        const formValue = undefined
        const apiValue = 'test'
        expect(convertApiValueType(formValue, apiValue)).toBe('test')
      })

      it('should return apiValue if formValue is a function', () => {
        const formValue = () => {
          /* no-op */
        }
        const apiValue = 'function'
        expect(convertApiValueType(formValue, apiValue)).toBe('function')
      })

      it('should handle arrays with empty objects', () => {
        const formValue = {
          items: [{}]
        }
        const apiValue = {
          items: [{ name: 'Item1' }, { name: 'Item2' }]
        }
        const expected = {
          items: [{ name: 'Item1' }, { name: 'Item2' }]
        }
        expect(convertApiValueType(formValue, apiValue)).toEqual(expected)
      })
    })
  })

  describe('mergeRepeatedProperties', () => {
    it('should merge properties ending with 2-9 into the corresponding property ending with 1', () => {
      const input = {
        propertyName1: ['value1'],
        propertyName2: 'value2',
        propertyName3: 'value3',
        anotherProperty1: 'anotherValue1',
        anotherProperty2: 'anotherValue2'
      }

      const output = {
        propertyName1: ['value1', 'value2', 'value3'],
        anotherProperty1: ['anotherValue1', 'anotherValue2']
      }

      expect(mergeRepeatedProperties(input)).toEqual(output)
    })

    it('should create an array if the target property is a string', () => {
      const input = {
        propertyName1: 'value1',
        propertyName2: ['value2', 'value3']
      }

      const output = {
        propertyName1: ['value1', 'value2', 'value3']
      }

      expect(mergeRepeatedProperties(input)).toEqual(output)
    })

    it('should handle cases where no matching "xxxxxx1" property exist', () => {
      const input = {
        propertyName1: 'value1',
        anotherProperty2: 'value2'
      }

      const output = {
        propertyName1: 'value1',
        anotherProperty2: 'value2'
      }

      expect(mergeRepeatedProperties(input)).toEqual(output)
    })

    it('should not modify the original object', () => {
      const input = {
        propertyName1: 'value1',
        propertyName2: 'value2'
      }

      const inputCopy = { ...input }
      mergeRepeatedProperties(input)
      expect(input).toEqual(inputCopy)
    })
  })

  describe('splitCommaValues', () => {
    it('splits comma-separated strings into unique arrays', () => {
      const input = { a: 'foo, bar, foo', b: 'baz', c: 'one, two, three' }
      const result = splitCommaValues(input)
      expect(result.a).toEqual(['foo', 'bar'])
      expect(result.b).toBe('baz')
      expect(result.c).toEqual(['one', 'two', 'three'])
    })

    it('splits arrays of comma-separated strings and flattens them', () => {
      const input = { a: ['foo, bar', 'baz', 'foo'], b: 'one, two' }
      const result = splitCommaValues(input)
      expect(result.a).toEqual(['foo', 'bar', 'baz'])
      expect(result.b).toEqual(['one', 'two'])
    })

    it('handles multivalueKeys: only processes specified keys', () => {
      const input = { a: 'foo, bar', b: 'baz, qux', c: 'one' }
      const result = splitCommaValues(input, ['b'])
      expect(result.a).toBe('foo, bar')
      expect(result.b).toEqual(['baz', 'qux'])
      expect(result.c).toBe('one')
    })

    it('returns original values if no commas present', () => {
      const input = { a: 'foo', b: ['bar'], c: 'baz' }
      const result = splitCommaValues(input)
      expect(result).toEqual(input)
    })

    it('removes duplicates in arrays', () => {
      const input = {
        a: ['foo, bar, foo', 'bar', 'foo'],
        b: ['baz, foo', 'bar', 'foo']
      }
      const result = splitCommaValues(input)
      expect(result.a).toEqual(['foo', 'bar'])
      expect(result.b).toEqual(['baz', 'foo', 'bar'])
    })
  })
})
