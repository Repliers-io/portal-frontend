import { runThrottled } from './concurrency'

const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('runThrottled', () => {
  it('never keeps more requests in flight than the pool allows', async () => {
    const gates = Array.from({ length: 10 }, deferred)
    let inFlight = 0
    let peak = 0

    const tasks = gates.map((gate, index) => async () => {
      inFlight++
      peak = Math.max(peak, inFlight)
      await gate.promise
      inFlight--
      return index
    })

    const run = runThrottled(tasks, undefined, { rps: 1000, concurrency: 3 })
    await Promise.resolve()
    await Promise.resolve()

    // The slow upstream is simulated by holding every task open: without a pool
    // all ten would be started at once, which is how the queue used to explode.
    expect(peak).toBe(3)

    gates.forEach((gate) => gate.resolve())
    expect(await run).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('reports progress once per finished task', async () => {
    const seen: number[] = []

    await runThrottled(
      [1, 2, 3].map((n) => async () => n),
      (completed) => seen.push(completed),
      { rps: 1000, concurrency: 2 }
    )

    expect(seen).toEqual([1, 2, 3])
  })
})
