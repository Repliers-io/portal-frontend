/** @jest-environment node */
import { getForwardedFrom } from 'utils/xff'

import { APIBase } from './APIBase'

jest.mock('utils/xff', () => ({ getForwardedFrom: jest.fn() }))
jest.mock('utils/tokens', () => ({
  getToken: jest.fn().mockResolvedValue(null),
  clearToken: jest.fn(),
  expired: jest.fn()
}))

const forwardedFrom = getForwardedFrom as jest.Mock

describe('APIBase.getHeaders', () => {
  it('sends the chain and the SSR token for a real request', async () => {
    forwardedFrom.mockResolvedValue({
      token: 'ssr-token',
      from: 'ssr',
      xff: 'a, b, c'
    })
    const headers = await new APIBase().getHeaders()

    expect(headers.get('X-Forwarded-For')).toBe('a, b, c')
    expect(headers.get('X-Forwarded-For-Token')).toBe('ssr-token')
    expect(headers.get('X-Forwarded-From')).toBe('ssr')
  })

  // An empty X-Forwarded-For is not equivalent to an absent one: it shifts the
  // backend's chain offset by one.
  it('omits X-Forwarded-For entirely when there is no chain', async () => {
    forwardedFrom.mockResolvedValue({ token: 'ssg-token', from: 'ssg' })
    const headers = await new APIBase().getHeaders()

    expect(headers.has('X-Forwarded-For')).toBe(false)
    expect(headers.get('X-Forwarded-For-Token')).toBe('ssg-token')
  })

  it('omits the token header when no token is configured', async () => {
    forwardedFrom.mockResolvedValue({ token: '', from: 'ssg' })
    const headers = await new APIBase().getHeaders()

    expect(headers.has('X-Forwarded-For-Token')).toBe(false)
  })

  it('sends no forwarding headers client-side', async () => {
    forwardedFrom.mockResolvedValue(null)
    const headers = await new APIBase().getHeaders()

    expect(headers.has('X-Forwarded-For')).toBe(false)
    expect(headers.has('X-Forwarded-For-Token')).toBe(false)
    expect(headers.has('X-Forwarded-From')).toBe(false)
  })
})
