import { cache } from 'react'

const clientSide = typeof window !== 'undefined'

type ForwardedFromType = 'csr' | 'ssr' | 'ssg'

export const getRequestHeaders = cache(async () => {
  if (clientSide) return null
  try {
    const { headers } = await import('next/headers')
    return headers()
  } catch {
    return null
  }
})

export const getForwardedFrom = async (): Promise<{
  token: string
  from: ForwardedFromType
} | null> => {
  if (clientSide) return null

  let token = ''
  let from: ForwardedFromType = 'ssg'

  try {
    const headers = await getRequestHeaders()
    if (headers) {
      from = 'ssr'
      token = process.env.NEXT_SSR_REQUEST_TOKEN || ''
    } else {
      token = process.env.NEXT_SSG_REQUEST_TOKEN || ''
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    token = process.env.NEXT_SSG_REQUEST_TOKEN || ''
  }

  return { token, from }
}
