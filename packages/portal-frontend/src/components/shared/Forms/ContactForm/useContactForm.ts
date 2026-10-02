'use client'

import { useEffect, useEffectEvent } from 'react'

import type { FormKey } from '@defaults/forms'

import { APIContact, type ErrorCause } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { sanitizePhoneNumber } from 'utils/listings/sanitizers'

import { identityFields } from '../fieldSchemas'
import { identityDefaults, useRequirementsForm } from '../useRequirementsForm'

import { contactFields, type ContactFormValues } from './schema'

export type UseContactFormOptions = {
  onSend?: () => void
  message?: string
  showMessage?: boolean
  redirectUrl?: string
  // When provided, the form submits a property enquiry to /contact/requestinfo
  // with the listing attached; otherwise it posts a general comment to /contactus.
  mlsNumber?: string
  // FUB tags for the lead this form produces; forwarded to the backend as-is.
  tags?: string[]
  // Config key this form's requirements are read under; defaults to the endpoint it posts to.
  form?: FormKey
}

export const useContactForm = (options: UseContactFormOptions = {}) => {
  const {
    onSend,
    message: messageDefault = '',
    showMessage = true,
    redirectUrl,
    mlsNumber,
    tags
  } = options

  const { showSnackbar } = useSnackbar()
  const { profile } = useUser()

  const getDefaultValues = (): ContactFormValues => ({
    ...identityDefaults(profile),
    message: messageDefault
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
    requirements,
    t
  } = useRequirementsForm<ContactFormValues>({
    form: options.form ?? (mlsNumber ? 'requestInfo' : 'contact'),
    fields: showMessage ? contactFields : identityFields,
    defaultValues: getDefaultValues()
  })

  // Seed identity fields once the user profile resolves. Keyed on profile only —
  // the message is driven separately (below) so that changing it never wipes
  // name/email/phone.
  const seedDefaults = useEffectEvent(() => reset(getDefaultValues()))

  useEffect(() => {
    seedDefaults()
  }, [profile])

  // Reflect a controlled message — the listing-enquiry radio drives one — into the
  // field without touching what the visitor has already typed elsewhere.
  useEffect(() => {
    if (options.message !== undefined) setValue('message', options.message)
  }, [options.message, setValue])

  const onSubmit = async (values: ContactFormValues) => {
    // A blank optional field comes back undefined (`.empty('')` in the schema);
    // the request keeps carrying an empty string.
    const payload = {
      name: values.name ?? '',
      email: values.email ?? '',
      phone: sanitizePhoneNumber(values.phone ?? ''),
      message: values.message ?? ''
    }

    try {
      if (mlsNumber) {
        await APIContact.requestInfo({ ...payload, mlsNumber })
      } else {
        await APIContact.addComment({
          pageUrl: window.location.href,
          ...payload,
          tags
        })
      }
      reset(getDefaultValues())
      onSend?.()

      if (redirectUrl) {
        window.open(redirectUrl, '_blank', 'noopener,noreferrer')
      } else {
        showSnackbar(t('messageSent'), 'success')
      }
    } catch (e) {
      showSnackbar((e as ErrorCause)?.cause?.message, 'error')
    }
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    isSubmitting,
    requirements,
    t
  }
}
