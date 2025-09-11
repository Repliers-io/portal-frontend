import { capitalize, joinNonEmpty, pluralize, random } from './strings'

describe('utils/strings', () => {
  it('should capitalize every word in the string', () => {
    const initial = 'hello world'
    const expected = 'Hello World'
    expect(capitalize(initial)).toEqual(expected)
  })

  it('capitalize should NOT touch caps letters in abbreviations', () => {
    const initial = 'ABCD eFg'
    const expected = 'ABCD EFg'
    expect(capitalize(initial)).toEqual(expected)
  })

  it('capitalize should NOT touch letters inside the word', () => {
    const initial = 'fireplace(s) and pool-s'
    const expected = 'Fireplace(s) And Pool-s'
    expect(capitalize(initial)).toEqual(expected)
  })

  it('capitalize should handle words with apostrophes', () => {
    const initial = "l'homme and l'école"
    const expected = "L'homme And L'école"
    expect(capitalize(initial)).toEqual(expected)
  })

  const forms = { one: '$ item', many: '$ items', zero: 'no items' }

  it('should pluralize the word based on the count', () => {
    expect(pluralize(0, forms)).toEqual('no items')
    expect(pluralize(1, forms)).toEqual('1 item')
    expect(pluralize(2, forms)).toEqual('2 items')
    expect(pluralize(-1, forms)).toEqual('-1 item')
  })

  it('should return `many` form if count couldnt be parsed as natural number', () => {
    expect(pluralize(NaN, forms)).toEqual('NaN items')
    expect(pluralize(Infinity, forms)).toEqual('∞ items')
  })

  it('should return `many` form if `zero` form isnt specified', () => {
    const forms = { one: '$ item', many: '$ items' }
    expect(pluralize(0, forms)).toEqual('0 items')
  })

  it('should return empty string if zero form set to ""', () => {
    const forms = { one: '$ item', many: '$ items', zero: '' }
    expect(pluralize(0, forms)).toEqual('')
  })

  it('should only join non empty strings', () => {
    const items1 = ['hello', 'world', '', '']
    const items2 = ['', 'world']
    const items3 = [' ', ' ']
    const items4 = [undefined, null, false, '0', NaN, 'false']
    const separator = ':'
    expect(joinNonEmpty(items1, separator)).toEqual('hello:world')
    expect(joinNonEmpty(items2, separator)).toEqual('world')
    expect(joinNonEmpty(items3, separator)).toEqual('')
    expect(joinNonEmpty(items4, separator)).toEqual('0:false')
  })

  it('should return random string of alphanumerical characters', () => {
    expect(random()).toMatch(/[a-z0-9]/gi)
    expect(random(10)).toHaveLength(10)
    expect(random()).toHaveLength(8)
    expect(random(1)).toHaveLength(1)
    expect(random(0)).toHaveLength(0)
    expect(random(-1)).toHaveLength(0)
    expect(random(NaN)).toHaveLength(0)
    expect(random(Infinity)).toHaveLength(0)
  })
})
