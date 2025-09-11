import { property1, property2, property3, property4 } from './__mocks__'
import { sanitizeAddress } from './sanitizers'

describe('utils/properties/sanitizers', () => {
  it('should correctly sanitize addresses', () => {
    expect(sanitizeAddress(property1.address)).toBe(
      'ph3-135-lower-barrette-way-east-ottawa-k1l-7z9'
    )
    expect(sanitizeAddress(property2.address)).toBe(
      '135-lower-barrette-way-ottawa-k1l-7z9'
    )
    expect(sanitizeAddress(property3.address)).toBe(
      '13-5-d-artagnan-bay-ottawa'
    )
    expect(sanitizeAddress(property4.address)).toBe('')
  })
})
