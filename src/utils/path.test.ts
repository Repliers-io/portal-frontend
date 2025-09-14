import { getPath, getPaths } from './path'

describe('EstimateProvider utils', () => {
  describe('getPaths', () => {
    it('should return all paths for a flat object', () => {
      const obj = {
        name: 'John',
        age: 30,
        city: 'New York'
      }
      const expected = ['name', 'age', 'city']
      expect(getPaths(obj)).toEqual(expected)
    })

    it('should return all paths for a nested object', () => {
      const obj = {
        user: {
          name: 'Jane',
          address: {
            street: 'Main St',
            number: 123
          }
        },
        active: true
      }
      const expected = [
        'user.name',
        'user.address.street',
        'user.address.number',
        'active'
      ]
      expect(getPaths(obj)).toEqual(expected)
    })

    it('should handle objects with arrays correctly', () => {
      const obj = {
        users: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 28 }
        ],
        count: 2
      }
      const expected = ['users', 'count'] // Arrays are treated as leaf nodes
      expect(getPaths(obj)).toEqual(expected)
    })

    it('should handle empty objects', () => {
      const obj = {}
      const expected: string[] = []
      expect(getPaths(obj)).toEqual(expected)
    })

    it('should handle deeply nested objects', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      }
      const expected = ['level1.level2.level3.value']
      expect(getPaths(obj)).toEqual(expected)
    })

    it('should stop at maxDepth', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      }
      const expected = ['level1.level2.level3']
      expect(getPaths(obj, 3)).toEqual(expected)
    })
  })

  describe('getPath', () => {
    const obj = {
      user: {
        name: 'John',
        address: {
          street: 'Main St',
          number: 123
        }
      },
      active: true
    }

    it('should return the correct value for existing flat path', () => {
      const path = 'active'
      expect(getPath(obj, path)).toBe(true)
    })

    it('should return the correct value for existing nested path', () => {
      const path = 'user.address.street'
      expect(getPath(obj, path)).toBe('Main St')
    })

    it('should return undefined for non-existing path', () => {
      const path = 'user.phone.number'
      expect(getPath(obj, path)).toBeUndefined()
    })

    it('should return undefined for empty path', () => {
      const path = ''
      expect(getPath(obj, path)).toBeUndefined()
    })

    it('should handle array indices in path', () => {
      const arrayObj = {
        users: [{ name: 'Alice' }, { name: 'Bob' }]
      }
      const path = 'users.1.name'
      expect(getPath(arrayObj, path)).toBe('Bob')
    })

    it('should return undefined for out-of-bounds array index', () => {
      const arrayObj = {
        users: [{ name: 'Alice' }]
      }
      const path = 'users.5.name'
      expect(getPath(arrayObj, path)).toBeUndefined()
    })
  })
})
