import cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { v4 as uuidv4 } from 'uuid'

import storageConfig from '@configs/storage'

import { requestScoped } from './xff'

const { tokenKey } = storageConfig

const clientSide = typeof window !== 'undefined'

// Async access to cookies on the server. Outside a request there is no cookie
// jar — and cookies() there marks the route dynamic, see requestScoped.
async function getSsrTokenAsync(): Promise<string | null> {
  if (!(await requestScoped())) return null
  try {
    const { cookies } = await import('next/headers')
    const cookiesStore = await cookies()
    const tokenCookie = cookiesStore.get(tokenKey)
    return tokenCookie?.value || null
  } catch {
    return null
  }
}

async function clearSsrTokenAsync(): Promise<void> {
  if (!(await requestScoped())) return
  try {
    const { cookies } = await import('next/headers')
    const cookiesStore = await cookies()
    cookiesStore.delete(tokenKey)
  } catch {
    // Cookies are read-only outside a Server Action / Route Handler.
  }
}

// Client-side functions remain unchanged
const getCsrToken = (): string | null => {
  const token = cookies.get(tokenKey)
  return token || null
}

export const clearCsrToken = (): void => {
  cookies.remove(tokenKey)
}

// Universal function to get token
export const getToken = async (): Promise<string | null> => {
  if (clientSide) {
    return getCsrToken()
  }
  return getSsrTokenAsync()
}

// Synchronous version of getToken to support existing functionality
export const getTokenSync = (): string | null => {
  return clientSide ? getCsrToken() : null
}

// Universal function to clear token
export const clearToken = async (): Promise<void> => {
  if (clientSide) {
    clearCsrToken()
  } else {
    await clearSsrTokenAsync()
  }
}

// Synchronous version of clearToken to support existing functionality
export const clearTokenSync = (): void => {
  if (clientSide) clearCsrToken()
}

export const setToken = (token: string): void => {
  if (!clientSide) return
  cookies.set(tokenKey, token, {
    expires: 30, // days
    path: '/'
  })
}

export const expired = (token: string) => {
  const currentTime = Math.floor(Date.now() / 1000)
  try {
    const decoded = jwtDecode(token)
    return currentTime > decoded.exp!
  } catch {
    console.error('expired -> error')
    return true
  }
}

export const refreshNeeded = (token: string) => {
  const currentTime = Math.floor(Date.now() / 1000)
  const decoded = jwtDecode(token)

  const tokenLifespan = decoded.exp! - decoded.iat!
  const timeLeft = decoded.exp! - currentTime
  const refreshTime = tokenLifespan * 0.5 // 50% of the token lifespan, see JWT_EXPIRE .env var on server-side

  return timeLeft < refreshTime
}

let sessionToken = ''

export const getSessionToken = () => {
  if (!sessionToken) {
    sessionToken = uuidv4()
  }

  return sessionToken
}
