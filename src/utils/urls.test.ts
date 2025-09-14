import apiConfig from '@configs/api'

import {
  getCDNPath,
  getEstimateUrl,
  getProtocolHost,
  getYoutubeVideoId
} from './urls'

describe('utils/urls', () => {
  it('should return image path with the correct size', () => {
    const filename = 'image.jpg'
    const expectedPath = `${apiConfig.repliersCdn}/${filename}?&webp&class=large`
    expect(getCDNPath(filename, 'large')).toBe(expectedPath)
  })

  it('should return the correct video ID for a standard YouTube URL', () => {
    const expectedVideoId = '5IsJleT9bOA'

    const url1 = 'https://www.youtube.com/watch?v=5IsJleT9bOA'
    const url2 = 'https://youtu.be/5IsJleT9bOA'
    const url3 = 'https://www.youtube.com/embed/5IsJleT9bOA'
    const url4 = 'https://www.youtube.com/watch?v=5IsJleT9bOA&feature=youtu.be'

    expect(getYoutubeVideoId(url1)).toBe(expectedVideoId)
    expect(getYoutubeVideoId(url2)).toBe(expectedVideoId)
    expect(getYoutubeVideoId(url3)).toBe(expectedVideoId)
    expect(getYoutubeVideoId(url4)).toBe(expectedVideoId)
  })

  it('should return an empty string for an invalid YouTube URL', () => {
    const url1 = 'https://www.youtube.com/'
    const url2 = 'https://www.example.com/'

    expect(getYoutubeVideoId(url1)).toBe('')
    expect(getYoutubeVideoId(url2)).toBe('')
  })
})

describe('getProtocolHost', () => {
  it('should return the correct protocol and host when both are provided', () => {
    const headers = new Map([
      ['host', 'example.com'],
      ['x-forwarded-proto', 'https']
    ])
    expect(getProtocolHost(headers as unknown as Headers)).toBe(
      'https://example.com'
    )
  })

  it('should return http as default protocol when x-forwarded-proto is missing', () => {
    const headers = new Map([['host', 'example.com']])
    expect(getProtocolHost(headers as unknown as Headers)).toBe(
      'http://example.com'
    )
  })

  it('should handle case when host is missing', () => {
    const headers = new Map([['x-forwarded-proto', 'https']])
    expect(getProtocolHost(headers as unknown as Headers)).toBe(
      'https://localhost'
    )
  })

  it('should handle case when headers are empty or null or not passed', () => {
    const headers = new Map()
    expect(getProtocolHost(headers as unknown as Headers)).toBe(
      'http://localhost'
    )
    expect(getProtocolHost(null)).toBe('http://localhost:3000')
    expect(getProtocolHost()).toBe('http://localhost:3000')
  })
})

describe('useEstimateUrl utils', () => {
  describe('getEstimateUrl', () => {
    it('returns url with query params (mode=url)', () => {
      const url = getEstimateUrl({
        step: 2,
        ulid: 'abc123',
        clientId: 42,
        signature: 'signature',
        agentRole: true
      })
      expect(url).toBe('/estimate?clientId=42&s=signature&step=2&ulid=abc123')
    })
    it('returns url without step for client (step not set, agentRole false)', () => {
      const url = getEstimateUrl({
        ulid: 'abc123',
        clientId: 42
      })
      expect(url).toBe('/estimate?clientId=42&ulid=abc123')
    })

    it('returns url without step for EstimateResult page (step=0, estimateId set)', () => {
      const url = getEstimateUrl({
        step: 0,
        estimateId: 99
      })
      expect(url).toBe('/estimate?estimateId=99')
    })

    it('should not include clientId if agentRole is false', () => {
      const url = getEstimateUrl({
        step: 2,
        clientId: 42,
        estimateId: 99,
        mode: 'route'
      })
      expect(url).toBe('/estimate/99/step/2')
    })

    it('should prioritize ulid over estimateId', () => {
      const url = getEstimateUrl({
        agentRole: true,
        clientId: 42,
        step: 2,
        ulid: 'abc123',
        estimateId: 99,
        signature: 'signature'
      })
      expect(url).toBe('/estimate?clientId=42&s=signature&step=2&ulid=abc123')
    })

    it('returns route string with step as string name (mode=route, stepStringName)', () => {
      const url = getEstimateUrl({
        stepStringName: true,
        step: 2,
        ulid: 'abc123',
        clientId: 42,
        signature: 'signature',
        agentRole: true,
        mode: 'route'
      })
      expect(url).toBe(
        '/agent/client/42/estimate/abc123/step/homeDetails?s=signature'
      )
    })

    it('should drop all agent params if agentRole is false', () => {
      const url = getEstimateUrl({
        stepStringName: true,
        step: 2,
        estimateId: 99,
        clientId: 42,
        signature: 'signature',
        mode: 'route'
      })
      expect(url).toBe('/estimate/99/step/homeDetails')
    })

    it('returns route string with step as number (mode=route)', () => {
      const url = getEstimateUrl({
        step: 3,
        estimateId: 99,
        agentRole: false,
        mode: 'route'
      })
      expect(url).toBe('/estimate/99/step/3')
    })

    it('returns root route if no params and rootPage set', () => {
      const url = getEstimateUrl({
        rootPage: '/root',
        mode: 'route'
      })
      expect(url).toBe('/root')
    })

    it('client estimates should not show 0 step', () => {
      const url = getEstimateUrl({ step: 0 })
      expect(url).toBe('/estimate')
    })

    it('client estimates should not show 0 step even with stepStringName and `route` mode', () => {
      const url = getEstimateUrl({
        step: 0,
        mode: 'route',
        stepStringName: true
      })
      expect(url).toBe('/estimate')
    })

    it('returns new estimate route under agent/client path', () => {
      const url = getEstimateUrl({
        agentRole: true,
        clientId: 42,
        mode: 'route'
      })
      expect(url).toBe('/agent/client/42/estimate')
    })

    it('returns agent/client-estimate route with estimate result', () => {
      const url = getEstimateUrl({
        agentRole: true,
        estimateId: 99,
        clientId: 42,
        mode: 'route'
      })
      expect(url).toBe('/agent/client/42/estimate/99')
    })

    it('should return agent/client-estimate route if the estimate was just created and agentRole is set', () => {
      const url = getEstimateUrl({
        agentRole: true,
        clientId: 42,
        step: 1,
        mode: 'route'
      })
      expect(url).toBe('/agent/client/42/estimate/step/1')
    })

    it('should return new estimate route for agent/client path', () => {
      const url = getEstimateUrl({
        agentRole: true,
        clientId: 42,
        mode: 'route'
      })
      expect(url).toBe('/agent/client/42/estimate')
    })

    it('should add signature even for empty params if agentRole is true', () => {
      const url = getEstimateUrl({
        signature: 'signature',
        agentRole: true
      })
      expect(url).toBe('/estimate?s=signature')
    })

    it('agents should never see the root page even for empty params', () => {
      const url = getEstimateUrl({
        rootPage: '/root',
        agentRole: true
      })
      expect(url).toBe('/estimate')
    })
  })
})
