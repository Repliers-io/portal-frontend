/**
 * Rate limiter factory for `next build`: paces callers to `rps` requests/sec
 * across the WHOLE build (override via the given env var). Prerender workers
 * are separate processes, so each enforces its own share:
 * interval = workers / rps. NEXT_BUILD_WORKERS is inlined by next.config.js.
 *
 * Callers MUST await the slot BEFORE arming any request timeout — time spent
 * queued here would otherwise eat the request's own abort budget.
 * No-op outside the `next build` phase.
 */
export const createRateLimit = (envVar: string, defaultRps: number) => {
  let nextSlotAt = 0

  return async (): Promise<void> => {
    if (process.env.NEXT_PHASE !== 'phase-production-build') return
    const rps = Number(process.env[envVar]) || defaultRps
    const workers = Number(process.env.NEXT_BUILD_WORKERS) || 1
    const now = Date.now()
    const slot = Math.max(now, nextSlotAt)
    nextSlotAt = slot + (1000 * workers) / rps
    if (slot > now) {
      await new Promise((resolve) => setTimeout(resolve, slot - now))
    }
  }
}
