import { useCallback, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type FormValues } from '@configs/estimate'

import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

const requestErrorMessage = 'Failed to request OTP'
const confirmationErrorMessage = 'Failed to confirm OTP'
const agentErrorMessage =
  'This $ is already in use by another agent. Please log in as an agent.'
const expiredErrorMessage = 'The code you are trying to use is expired.'

const useOtpAuth = (formMethods: UseFormReturn<FormValues>) => {
  const [loading, setLoading] = useState(false)
  const { getValues } = formMethods
  const { showSnackbar } = useSnackbar()
  const { requestOtpLogin, loginWithOtp } = useUser()

  const requestLogin = useCallback(async () => {
    setLoading(true)
    try {
      const contactValues = getValues('contact')
      const response = await requestOtpLogin(contactValues)
      // 403 error codes are not the errors but the message that the current OTP code
      // is still active and could be used without resending a new one
      if (response.status === 403) {
        return true
      } else if (response.status >= 400) {
        const errorField = response?.data?.info?.[0]?.param || 'email'
        showSnackbar(
          response.status === 409
            ? agentErrorMessage.replace('$', errorField)
            : requestErrorMessage,
          'error'
        )
        return false
      }
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmLogin = useCallback(async () => {
    setLoading(true)
    const code = getValues('contact.confirmationCode')
    try {
      await loginWithOtp(code!)
      return true
    } catch (error: any) {
      const message =
        error?.status === 403 ? expiredErrorMessage : confirmationErrorMessage
      showSnackbar(message, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, requestLogin, confirmLogin }
}

export default useOtpAuth
