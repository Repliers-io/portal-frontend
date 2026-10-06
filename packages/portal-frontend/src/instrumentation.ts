/* eslint-disable no-console */
export async function register() {
  // Only run in the Node.js server runtime, not Edge
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // Schools cache warm-up is only relevant for the movesmartly-com tenant
  if (process.env.NEXT_PUBLIC_APP_CONFIGURATION !== 'movesmartly-com') return

  // Dynamic import keeps this out of the client bundle entirely
  const { MoveSmartlyAPI } = await import('services/MoveSmartly')
  try {
    console.log('[instrumentation] Pre-warming schools cache…')
    await MoveSmartlyAPI.fetchSchools()
    console.log('[instrumentation] Schools cache ready.')
  } catch (err) {
    // Non-fatal — the route handler will retry on first request
    console.warn('[instrumentation] Schools cache warm-up failed:', err)
  }
}

// Next.js invokes this for every server-side error — SSR render throws, RSC
// errors, and route handlers — including the ones that render the standard 500
// page. Central capture so intermittent PDP 500s expose the real URL, route and
// stack instead of being lost in stdout. `digest` matches the value shown on the
// 500 page, so a report can be tied back to a specific failed request.
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath?: string; routeType?: string; renderSource?: string }
) {
  const err = error as { message?: string; stack?: string; digest?: string }
  console.error('[onRequestError]', {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    digest: err.digest,
    message: err.message,
    stack: err.stack
  })
}
