import type { PageProps } from './page'
import { parseEstimateParams } from './utils'

describe('parseEstimateParams', () => {
  it('should parse basic estimate parameters and preserve rest parameters', () => {
    const params: PageProps['params'] = {}
    const searchParams: PageProps['searchParams'] = {
      step: '2',
      estimateId: '123',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'test-campaign',
      utm_term: 'calgary homes',
      utm_content: 'homepage-banner',
      gclid: 'Cj0KCQjw_test_gclid_example',
      fbclid: 'IwAR0_test_fbclid_example',
      msclkid: 'test_msclkid_example',
      _ga: 'GA1.2.123456789.1234567890',
      _gid: 'GA1.2.987654321.0987654321'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result).toEqual({
      step: 2,
      estimateId: 123,
      clientId: undefined,
      signature: undefined,
      rest: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test-campaign',
        utm_term: 'calgary homes',
        utm_content: 'homepage-banner',
        gclid: 'Cj0KCQjw_test_gclid_example',
        fbclid: 'IwAR0_test_fbclid_example',
        msclkid: 'test_msclkid_example',
        _ga: 'GA1.2.123456789.1234567890',
        _gid: 'GA1.2.987654321.0987654321'
      }
    })
  })

  it('should handle ulid parameter correctly', () => {
    const params: PageProps['params'] = {}
    const searchParams: PageProps['searchParams'] = {
      ulid: 'test-ulid-123',
      utm_source: 'google'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result).toEqual({
      step: 0,
      estimateId: 'test-ulid-123',
      clientId: undefined,
      signature: undefined,
      rest: {
        utm_source: 'google'
      }
    })
  })

  it('should handle slug parameters and preserve rest', () => {
    const params: PageProps['params'] = {
      slugs: ['123', 'step', '2']
    }
    const searchParams: PageProps['searchParams'] = {
      utm_source: 'facebook',
      utm_content: 'test-content'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result).toEqual({
      step: 2,
      estimateId: '123',
      clientId: undefined,
      signature: undefined,
      rest: {
        utm_source: 'facebook',
        utm_content: 'test-content'
      }
    })
  })

  it('should handle agent signature and clientId', () => {
    const params: PageProps['params'] = {
      clientId: '456'
    }
    const searchParams: PageProps['searchParams'] = {
      s: 'agent-signature',
      utm_term: 'test-term'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result).toEqual({
      step: 0,
      estimateId: undefined,
      clientId: 456,
      signature: 'agent-signature',
      rest: {
        utm_term: 'test-term'
      }
    })
  })

  it('should return empty rest object when no additional parameters', () => {
    const params: PageProps['params'] = {}
    const searchParams: PageProps['searchParams'] = {
      step: '1',
      estimateId: '789'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result).toEqual({
      step: 1,
      estimateId: 789,
      clientId: undefined,
      signature: undefined,
      rest: {}
    })
  })

  it('should filter out undefined values from rest', () => {
    const params: PageProps['params'] = {}
    const searchParams: PageProps['searchParams'] = {
      step: '1',
      utm_source: 'google',
      empty_param: undefined
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result.rest).toEqual({
      utm_source: 'google'
    })
    expect(result.rest).not.toHaveProperty('empty_param')
  })

  it('should preserve common tracking parameters', () => {
    const params: PageProps['params'] = {}
    const searchParams: PageProps['searchParams'] = {
      estimateId: '456',
      // Google Ads
      gclid: 'Cj0KCQjw_real_google_click_id',
      // Facebook Ads
      fbclid: 'IwAR0_real_facebook_click_id',
      // Microsoft Ads
      msclkid: 'real_microsoft_click_id',
      // Google Analytics
      _ga: 'GA1.2.1234567890.1234567890',
      _gid: 'GA1.2.0987654321.0987654321',
      // Additional custom tracking
      ref: 'newsletter',
      source: 'email-campaign',
      medium: 'email'
    }

    const result = parseEstimateParams(params, searchParams)

    expect(result.rest).toEqual({
      gclid: 'Cj0KCQjw_real_google_click_id',
      fbclid: 'IwAR0_real_facebook_click_id',
      msclkid: 'real_microsoft_click_id',
      _ga: 'GA1.2.1234567890.1234567890',
      _gid: 'GA1.2.0987654321.0987654321',
      ref: 'newsletter',
      source: 'email-campaign',
      medium: 'email'
    })
    expect(result.estimateId).toBe(456)
  })
})

describe('REST parameters preservation integration test', () => {
  it('should demonstrate complete flow of preserving UTM and tracking parameters', () => {
    // Simulate incoming URL with estimate params + UTM/tracking params
    const searchParams: PageProps['searchParams'] = {
      step: '2',
      estimateId: '123',
      // UTM parameters
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'calgary-homes',
      utm_term: 'real estate',
      utm_content: 'banner-ad',
      // Tracking IDs
      gclid: 'Cj0KCQjw_real_google_click_id',
      fbclid: 'IwAR0_real_facebook_click_id',
      msclkid: 'real_microsoft_click_id',
      // Google Analytics
      _ga: 'GA1.2.1234567890.1234567890',
      _gid: 'GA1.2.0987654321.0987654321',
      // Custom tracking
      ref: 'newsletter',
      source: 'email'
    }

    // Test parseEstimateParams extracts known params and preserves rest
    const result = parseEstimateParams({}, searchParams)

    // Known estimate parameters should be extracted
    expect(result.step).toBe(2)
    expect(result.estimateId).toBe(123)
    expect(result.clientId).toBeUndefined()
    expect(result.signature).toBeUndefined()

    // ALL tracking parameters should be preserved in rest
    expect(result.rest).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'calgary-homes',
      utm_term: 'real estate',
      utm_content: 'banner-ad',
      gclid: 'Cj0KCQjw_real_google_click_id',
      fbclid: 'IwAR0_real_facebook_click_id',
      msclkid: 'real_microsoft_click_id',
      _ga: 'GA1.2.1234567890.1234567890',
      _gid: 'GA1.2.0987654321.0987654321',
      ref: 'newsletter',
      source: 'email'
    })

    // Verify none of the known estimate params leaked into rest
    expect(result.rest).not.toHaveProperty('step')
    expect(result.rest).not.toHaveProperty('estimateId')
    expect(result.rest).not.toHaveProperty('ulid')
    expect(result.rest).not.toHaveProperty('clientId')
    expect(result.rest).not.toHaveProperty('s')
  })

  it('should handle edge cases properly', () => {
    // Test with agent parameters
    const agentParams: PageProps['searchParams'] = {
      clientId: '456',
      s: 'agent-signature',
      ulid: 'test-ulid-123',
      utm_source: 'linkedin',
      utm_medium: 'social',
      custom_param: 'custom_value'
    }

    const result = parseEstimateParams({ clientId: '456' }, agentParams)

    expect(result.clientId).toBe(456)
    expect(result.signature).toBe('agent-signature')
    expect(result.estimateId).toBe('test-ulid-123') // ulid takes precedence
    expect(result.rest).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      custom_param: 'custom_value'
    })
  })

  it('should handle empty and undefined values correctly', () => {
    const mixedParams: PageProps['searchParams'] = {
      step: '1',
      utm_source: 'google',
      empty_string: '',
      undefined_param: undefined,
      zero_value: '0'
    }

    const result = parseEstimateParams({}, mixedParams)

    expect(result.step).toBe(1)
    // Only defined string values should be preserved
    expect(result.rest).toEqual({
      utm_source: 'google',
      empty_string: '',
      zero_value: '0'
    })
    // undefined values should be filtered out
    expect(result.rest).not.toHaveProperty('undefined_param')
  })
})
