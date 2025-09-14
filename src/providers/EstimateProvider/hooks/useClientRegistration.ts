import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type FormValues } from '@configs/estimate'

import { APIUser } from 'services/API'
import useSnackbar from 'hooks/useSnackbar'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'

const errorMessage = 'Failed to register new user'
const existingUserErrorMessage = 'This $ is already in use by another client.'

const useClientRegistration = (formMethods: UseFormReturn<FormValues>) => {
  const [loading, setLoading] = useState(false)
  const { setValue, getValues } = formMethods
  const { showSnackbar } = useSnackbar()

  const registerClient = async () => {
    const contactValues = getValues('contact')
    const { phone, ...rest } = contactValues
    const registerFields = {
      ...rest,
      ...(phone && { phone: sanitizePhoneNumber(phone) })
    }
    setLoading(true)
    try {
      const success = await APIUser.register(registerFields)
      if (!success) {
        showSnackbar(errorMessage, 'error')
        return null
      } else {
        const { clientId } = success
        setValue('clientId', clientId)
        return clientId
      }
    } catch (error: any) {
      const errorField = error?.data?.info?.[0]?.param || 'email'
      showSnackbar(existingUserErrorMessage.replace('$', errorField), 'error')
      console.error('[useClientRegistration]', errorMessage, error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, registerClient }
}

export default useClientRegistration
