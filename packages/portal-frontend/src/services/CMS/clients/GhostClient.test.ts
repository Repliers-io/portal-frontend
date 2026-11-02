import { ApiError } from 'services/API/APIBase'

import { GhostClient } from './GhostClient'

const mockBrowse = jest.fn()
const mockRead = jest.fn()

jest.mock('@tryghost/content-api', () => ({
  __esModule: true,
  default: jest.fn(() => ({ posts: { browse: mockBrowse, read: mockRead } }))
}))
jest.mock('utils/log', () => ({ logError: jest.fn() }))

// The shape the SDK rejects with: Ghost's first error spread over an Error, plus the
// axios response and the request config that carries the content key
const ghostRejection = (status: number, error: Record<string, string>) =>
  Object.assign(new Error(error.message), error, {
    response: { status, data: { errors: [error] } },
    config: { params: { key: 'content-key' } }
  })

const client = new GhostClient('https://example.ghost.io', 'content-key')

describe('GhostClient', () => {
  it("rethrows a Ghost rejection as an ApiError with the status and Ghost's reason", async () => {
    mockBrowse.mockRejectedValue(
      ghostRejection(400, {
        type: 'IncorrectUsageError',
        message: 'Incorrect usage error, cannot list posts.',
        context: 'The model layer expects using `withRelated`.'
      })
    )

    const error = await client.getTotalPosts().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toMatch(/400[\s\S]*withRelated/)
    expect((error as ApiError).message).not.toContain('content-key')
  })

  it('returns null for a post Ghost does not have', async () => {
    mockRead.mockRejectedValue(
      ghostRejection(404, {
        type: 'NotFoundError',
        message: 'Resource not found error, cannot read post.'
      })
    )

    await expect(client.getPost('missing')).resolves.toBeNull()
  })
})
