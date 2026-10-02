import { validateEmail } from './validators'

describe('utils/validators', () => {
  it('should return true for a valid email within the default max length', () => {
    const validEmail = 'test@example.com'
    expect(validateEmail(validEmail)).toBe(true)
  })

  it('should return true for a valid email within the specified max length', () => {
    const validEmail = `${'a'.repeat(20)}@example.com`
    expect(validateEmail(validEmail, 50)).toBe(true)
  })

  it('should return true for a valid email with a plus sign', () => {
    const validEmail = 'test+alias@example.com'
    expect(validateEmail(validEmail)).toBe(true)
  })

  it('should return false for an email longer than the default max length', () => {
    const longEmail = `${'a'.repeat(71)}@example.com`
    expect(validateEmail(longEmail)).toBe(false)
  })

  it('should return false for an email longer than the specified max length', () => {
    const longEmail = `${'a'.repeat(51)}@example.com`
    expect(validateEmail(longEmail, 50)).toBe(false)
  })

  it('should return false for an email with invalid characters or missing parts', () => {
    expect(validateEmail('test@exa!mple.com')).toBe(false)
    expect(validateEmail('test@@example.com')).toBe(false)
    expect(validateEmail('test @example.com')).toBe(false)
    expect(validateEmail('testexample.com')).toBe(false)
    expect(validateEmail('test@.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})
