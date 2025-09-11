import { renderValue } from './utils'

describe('renderValue', () => {
  it('should return a value', () => {
    const selected = 'value'
    const items = ['value', 'other']
    const result = renderValue(selected, items, false)
    expect(result).toBe('Value')
  })

  it('should not return a value when not in items', () => {
    const selected = 'value'
    const items = ['other']
    const result = renderValue(selected, items, false)
    expect(result).toBe('')
  })

  it('should return a comma-separated string with skipped values not in items when multiple is true', () => {
    const selected = ['value1', 'value2', 'value3']
    const items = ['value3', 'value2', 'other']

    const result = renderValue(selected, items, true)
    expect(result).toBe('Value2, Value3')
  })

  it('should return an empty string when selected is null', () => {
    const selected = null
    const items = ['value1', 'value2']

    const result = renderValue(selected, items, true)
    expect(result).toBe('')
  })

  it('should work with selected arguments passed as string, even when it is a multiple flag', () => {
    const selected = 'value2'
    const items = ['value1', 'value2']

    const result = renderValue(selected, items, true)
    expect(result).toBe('Value2')
  })
})
