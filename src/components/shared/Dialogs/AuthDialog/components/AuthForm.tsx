'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  Box,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material'

import storageConfig from '@configs/storage'

import { APIAuth, type LogInRequest, type SignUpRequest } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'
import useClientSide from 'hooks/useClientSide'
import useSnackbar from 'hooks/useSnackbar'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'

import {
  expiredOtpErrorMessage,
  missingCredentialsErrorMessage,
  otpResendSuccessMessage,
  unknownOtpErrorMessage,
  unknownSignupErrorMessage,
  userNotFoundErrorMessage
} from '../messages'

import {
  LoginFormStep,
  OtpFormStep,
  SelectAuthFlow,
  SignupFormStep,
  TermsAndPrivacy,
  ThirdPartyLoginForm
} from '.'

export type AuthFlow = 'login' | 'signup'
export type AuthStep = 'input' | 'verify'

const { lastAuthKey } = storageConfig
const resendOtpDuration = 60 // seconds

// NOTE: `onSuccess` callback should manually process successful login,
// e.g. redirect to a specific page or update AuthDialog state/visibility

const AuthForm = ({
  embedded = false,
  flow: defaultFlow = 'login',
  step: initialStep = 'input',
  onSuccess
}: {
  embedded?: boolean
  flow?: AuthFlow
  step?: AuthStep
  onSuccess?: () => void
}) => {
  const features = useFeatures()
  const trackEvent = useAnalytics()
  const searchParams = useSearchParams()
  const paramsEmail = searchParams.get('email') || ''
  const paramsPhone = searchParams.get('phone') || ''
  const paramsFlow = // sanitize `flow` from URL params
    (searchParams.get('flow') === 'signup' ? 'signup' : null) as AuthFlow | null

  const lastAuthFields = useMemo(() => {
    const emptyFields = { email: '', phone: '' }
    const fields = localStorage?.getItem(lastAuthKey)
    return fields ? JSON.parse(fields) : emptyFields
  }, [])

  const clientSide = useClientSide()
  const { showSnackbar } = useSnackbar()
  const [flow, setFlow] = useState<AuthFlow>(paramsFlow || defaultFlow)
  const [step, setStep] = useState<AuthStep>(initialStep)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [defaultValues, setDefaultValues] = useState<LogInRequest>({
    email: paramsEmail || lastAuthFields.email,
    // url and storage params should be sanitized
    phone: formatPhoneNumberAsYouType(paramsPhone || lastAuthFields.phone)
  })

  // State to hold shared values between login and signup forms
  const [sharedFormValues, setSharedFormValues] =
    useState<LogInRequest>(defaultValues)

  const [otpCooldown, setOtpCooldown] = useState(0)
  const [otpResendDisabled, setOtpResendDisabled] = useState(true)

  const loginVisible = flow === 'login' && step === 'input'
  const signupVisible = flow === 'signup' && step === 'input'
  const verifyVisible = step === 'verify'

  const formTitle = verifyVisible
    ? 'Confirmation'
    : loginVisible
      ? 'Sign in'
      : 'Sign up'

  const startCooldownTimer = useCallback(() => {
    setOtpResendDisabled(true)
    setOtpCooldown(resendOtpDuration)

    const timerId = setInterval(() => {
      setOtpCooldown((currentCooldown) => {
        if (currentCooldown <= 1) {
          clearInterval(timerId)
          setOtpResendDisabled(false)
          return 0
        }
        return currentCooldown - 1
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  const changeFlow = (newFlow: AuthFlow) => {
    // Reset this message on manual flow change
    // but OTP timer state is preserved intentionally unless explicitly reset
    setErrorMessage(null)
    setDefaultValues(sharedFormValues)
    // give a time for states to update before changing flow
    setTimeout(() => {
      setFlow(newFlow)
      // Reset step to `input` for the signup form
      setStep('input')
    }, 0)
  }

  const requestOtpLogin = async (params: LogInRequest) => {
    const { email, phone } = params
    if (!email && !phone) {
      setErrorMessage(missingCredentialsErrorMessage)
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      // API endpoint does not accept empty strings, so we set them to undefined
      await APIAuth.login({
        email: email || undefined,
        phone: sanitizePhoneNumber(phone) || undefined
      })
      setStep('verify')
      setErrorMessage('')
      if (otpCooldown === 0) startCooldownTimer()
    } catch (error: any) {
      if (error?.status === 403) {
        // User exists but OTP is required
        setStep('verify')
        if (otpCooldown === 0) startCooldownTimer()
      } else if (error?.status === 404) {
        // User not found, switch to signup and prefill
        changeFlow('signup')
        setErrorMessage(userNotFoundErrorMessage)
      } else if (error?.status === 400) {
        showSnackbar(error?.data?.userMessage || 'Server error.', 'error')
      } else {
        showSnackbar('An unexpected error occurred.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const requestNewOtp = async () => {
    await requestOtpLogin(sharedFormValues)
    showSnackbar(otpResendSuccessMessage, 'success')
  }

  const requestSignup = async (params: SignUpRequest) => {
    const { email, phone, lname, fname } = params
    const loginParams = {
      email,
      phone: sanitizePhoneNumber(phone) || undefined
    }
    setLoading(true)
    try {
      await APIAuth.signup({
        ...loginParams,
        lname,
        fname
      })
      setStep('verify')
      if (otpCooldown === 0) startCooldownTimer()
    } catch (error: any) {
      if (error?.status === 400) {
        showSnackbar(error?.data?.userMessage || 'Server error.', 'error')
      } else if (error?.status === 409) {
        // 409 for conflict/user exists
        requestOtpLogin(loginParams)
      } else {
        showSnackbar(unknownSignupErrorMessage, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const { loginWithOtp } = useUser()

  const confirmOtpLogin = async (code: string) => {
    setLoading(true)
    try {
      await loginWithOtp(code)
      localStorage.setItem(lastAuthKey, JSON.stringify(sharedFormValues))
      onSuccess?.()
    } catch (error: any) {
      const message =
        error?.status === 403 ? expiredOtpErrorMessage : unknownOtpErrorMessage
      showSnackbar(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    trackEvent('auth', { flow, step, type: embedded ? 'dialog' : 'page' })
  }, [flow, step])

  if (!features.messaging) return <ThirdPartyLoginForm />

  return (
    <>
      <DialogTitle>{formTitle}</DialogTitle>
      <DialogContent
        sx={{
          pb: 4,
          px: { sm: 8 },
          minHeight: 'auto',
          overflow: 'visible',
          flexGrow: 0
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480, pt: 1, mx: 'auto' }}>
          <Stack spacing={4}>
            {errorMessage && (
              <Typography
                variant="body2"
                color="error.main"
                textAlign="center"
                mt={-1}
                mb={-2}
              >
                {errorMessage}
              </Typography>
            )}
            <LoginFormStep
              loading={loading}
              visible={loginVisible}
              defaultValues={defaultValues}
              disabled={!clientSide || loading}
              onChange={setSharedFormValues}
              onSubmit={requestOtpLogin}
            />

            <SignupFormStep
              loading={loading}
              visible={signupVisible}
              defaultValues={defaultValues}
              disabled={!clientSide || loading}
              onChange={setSharedFormValues}
              onSubmit={requestSignup}
            />

            <OtpFormStep
              loading={loading}
              visible={verifyVisible}
              resendTimer={otpCooldown}
              resendDisabled={otpResendDisabled}
              onCancel={() => setStep('input')}
              onResend={requestNewOtp}
              onSubmit={confirmOtpLogin}
            />

            <TermsAndPrivacy />

            <SelectAuthFlow flow={flow} onChange={changeFlow} />
          </Stack>
        </Box>
      </DialogContent>
    </>
  )
}
export default AuthForm
