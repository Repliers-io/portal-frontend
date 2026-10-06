'use client'

import { useEffect, useMemo } from 'react'
import dayjs from 'dayjs'

import type { FormKey } from '@defaults/forms'

import { type ErrorCause } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

import { identityDefaults, useRequirementsForm } from '../useRequirementsForm'

import { scheduleFields, type ScheduleFormValues } from './schema'

type UseScheduleFormOptions = {
  form: FormKey
  // The caller owns the payload: tour and meeting post to different endpoints.
  send: (values: ScheduleFormValues) => Promise<unknown>
  onSend?: () => void
}

export const useScheduleForm = ({
  form,
  send,
  onSend
}: UseScheduleFormOptions) => {
  const { showSnackbar } = useSnackbar()
  const { profile } = useUser()

  // Tomorrow at noon, with whatever the profile knows about the visitor.
  const defaultValues = useMemo(
    (): ScheduleFormValues => ({
      ...identityDefaults(profile),
      date: dayjs().add(1, 'day'),
      time: dayjs().hour(12).minute(0)
    }),
    [profile]
  )

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitting },
    requirements,
    t
  } = useRequirementsForm<ScheduleFormValues>({
    form,
    fields: scheduleFields,
    defaultValues
  })

  // Seed the identity fields once the profile resolves.
  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      await send(values)
      showSnackbar(t('messageSent'), 'success')
      onSend?.()
    } catch (e) {
      showSnackbar((e as ErrorCause)?.cause?.message, 'error')
    }
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isSubmitting,
    requirements,
    trigger
  }
}
