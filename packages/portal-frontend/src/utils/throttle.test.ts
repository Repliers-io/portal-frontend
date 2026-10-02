import { createRateLimit } from './throttle'

describe('utils/throttle', () => {
  afterEach(() => {
    delete process.env.NEXT_PHASE
  })

  it('does not delay outside the build phase', async () => {
    const rateLimit = createRateLimit('THROTTLE_TEST_RPS', 50)

    const start = Date.now()
    await rateLimit()
    await rateLimit()
    expect(Date.now() - start).toBeLessThan(20)
  })

  it('spaces build-phase calls by the per-worker interval', async () => {
    process.env.NEXT_PHASE = 'phase-production-build'
    const rateLimit = createRateLimit('THROTTLE_TEST_RPS', 50) // 1 worker → 20ms between requests

    const start = Date.now()
    await rateLimit()
    await rateLimit()
    await rateLimit()

    expect(Date.now() - start).toBeGreaterThanOrEqual(35)
  })
})
