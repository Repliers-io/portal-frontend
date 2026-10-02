'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'

/**
 * Silent token login handler — renders nothing.
 * Reads `?token=` from the URL, logs the user in via tokenLogin API,
 * then removes the param from the URL without navigation.
 *
 * Use on pages that should support email-link login but don't require it
 * (listing pages, search pages, etc.).
 */
export const TokenLoginHandler = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { loginWithToken } = useUser()
  const { showDialog } = useDialog('otp-auth')

  useEffect(() => {
    if (!token) return

    const removeTokenFromUrl = () => {
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.toString())
    }

    const processToken = async () => {
      removeTokenFromUrl()
      try {
        await loginWithToken(token)
      } catch (error: unknown) {
        const status =
          error && typeof error === 'object' && 'status' in error
            ? (error as { status: number }).status
            : null
        // 412 — OTP required (second factor)
        if (status === 412) showDialog()
      }
    }

    processToken()
  }, [token])

  return null
}
