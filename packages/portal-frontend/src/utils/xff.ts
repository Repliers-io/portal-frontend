import { cache } from 'react'

const clientSide = typeof window !== 'undefined'

type ForwardedFromType = 'csr' | 'ssr' | 'ssg'

/**
 * Whether this render answers a real request. Static generation — `next build`,
 * a runtime ISR (re)generation, a cache scope — has no request behind it, and
 * `headers()`/`cookies()` there mark the route dynamic BEFORE they throw (Next
 * sets `revalidate = 0` first, so a try/catch changes nothing); a static route
 * then answers with a bare 500 ("Page changed from static to dynamic at
 * runtime"). Reads the same store those APIs consult, which registers nothing.
 */
export const requestScoped = async () => {
  if (clientSide) return false
  const { workUnitAsyncStorage } =
    await import('next/dist/server/app-render/work-unit-async-storage.external')
  return workUnitAsyncStorage.getStore()?.type === 'request'
}

export const getRequestHeaders = cache(async () => {
  if (!(await requestScoped())) return null

  try {
    const { headers } = await import('next/headers')
    return await headers()
  } catch {
    return null
  }
})

export const renderContext = async (): Promise<ForwardedFromType> => {
  if (clientSide) return 'csr'
  // A static render never reaches headers() (see requestScoped) and force-static
  // hands back an empty stub; a real request always carries `host`.
  return (await getRequestHeaders())?.get('host') ? 'ssr' : 'ssg'
}

export const getForwardedFrom = async (): Promise<{
  token: string
  from: ForwardedFromType
  xff?: string
} | null> => {
  if (clientSide) return null

  // Only a real x-forwarded-for proves there is a user behind this render. A
  // static render gets no headers and force-static an empty stub, so without
  // this it would send the SSR token with no client IP — the backend then bills
  // the production Repliers key and reports the dyno's own egress IP as the end
  // user.
  const xff = (await getRequestHeaders())?.get('x-forwarded-for') || undefined
  const from: ForwardedFromType = xff ? 'ssr' : 'ssg'
  const token =
    (from === 'ssr'
      ? process.env.NEXT_SSR_REQUEST_TOKEN
      : process.env.NEXT_SSG_REQUEST_TOKEN) || ''

  return { token, from, xff }
}
