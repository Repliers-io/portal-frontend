import pThrottle from 'p-throttle'

/**
 * Requests started per second. Caps the burst against a healthy upstream.
 */
const defaultRps = Number(process.env.LOCATIONS_GEN_RPS) || 6

/**
 * Requests allowed to be in flight at once — the knob that actually protects the
 * upstream. A rate limit alone keeps adding load no matter how many requests are
 * still unanswered: at 6/s against a 30s response, 180 requests pile up in the
 * first half-minute and the queue only grows, which is how a generation run
 * collapses into client-side timeouts. A pool stops adding work as soon as
 * answers slow down, so the run self-regulates instead of stampeding.
 */
const defaultConcurrency = Number(process.env.LOCATIONS_GEN_CONCURRENCY) || 8

/**
 * Runs `tasks` with both limits applied and preserves result order.
 * Effective throughput is whichever bites first: the rate, or concurrency
 * divided by upstream latency.
 */
export async function runThrottled<T>(
  tasks: Array<() => Promise<T>>,
  onProgress?: (completed: number, total: number) => void,
  {
    rps = defaultRps,
    concurrency = defaultConcurrency
  }: { rps?: number; concurrency?: number } = {}
): Promise<T[]> {
  if (tasks.length === 0) return []

  const total = tasks.length
  const results: T[] = new Array(total)
  const start = pThrottle({ limit: rps, interval: 1000 })(
    (task: () => Promise<T>) => task()
  )

  let next = 0
  let completed = 0

  async function worker() {
    while (next < total) {
      const index = next++
      results[index] = await start(tasks[index])
      completed++
      onProgress?.(completed, total)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, total) }, worker)
  )

  return results
}
