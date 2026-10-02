'use client'

import { useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  useForm
} from 'react-hook-form'

import type { FormFieldName, FormKey } from '@defaults/forms'
import { joiResolver } from '@hookform/resolvers/joi'

import type { UserProfile } from 'providers/UserProvider'
import { sanitizePhoneNumber } from 'utils/listings/sanitizers'
import { joinNonEmpty } from 'utils/strings'

import { createFormSchema } from './fieldSchemas'
import { requiredAnyType, withGroupCheck } from './groupResolver'
import { resolveRequirements } from './requirements'

export const identityDefaults = (profile: UserProfile) => ({
  name: joinNonEmpty([profile.fname, profile.lname], ' '),
  email: profile.email || '',
  phone: sanitizePhoneNumber(profile.phone)
})

type UseRequirementsFormOptions<TValues extends FieldValues> = {
  form: FormKey
  // The fields the form renders — requirements resolve over these only.
  fields: FormFieldName[]
  defaultValues: DefaultValues<TValues>
}

export const useRequirementsForm = <TValues extends FieldValues>({
  form,
  fields,
  defaultValues
}: UseRequirementsFormOptions<TValues>) => {
  const t = useTranslations('Forms')

  const requirements = useMemo(
    () => resolveRequirements(form, fields),
    [form, fields]
  )

  // Joi rejects unknown keys, so the schema covers every value the form holds,
  // rendered or not — the contact form keeps `message` while hiding it.
  const valueFields = Object.keys(defaultValues).join()

  const resolver = useMemo(
    () =>
      withGroupCheck<TValues>(
        joiResolver(
          createFormSchema<TValues>(
            t,
            requirements,
            valueFields.split(',') as FormFieldName[]
          )
        ),
        requirements.groups,
        t('emailOrPhoneRequired')
      ),
    [t, requirements, valueFields]
  )

  const formMethods = useForm<TValues>({
    resolver,
    mode: 'onSubmit',
    defaultValues
  })
  const { watch, getFieldState, clearErrors } = formMethods

  // With a resolver RHF revalidates the whole schema on change but clears the error
  // of the changed field only, so a satisfied group would keep its error on the
  // field the user never touched.
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      requirements.groups.forEach((group) => {
        if (!name || !group.includes(name as FormFieldName)) return

        const filled = group.some((field) =>
          String(values[field as keyof typeof values] ?? '').trim()
        )
        if (!filled) return

        group.forEach((field) => {
          const target = field as Path<TValues>
          if (getFieldState(target).error?.type === requiredAnyType) {
            clearErrors(target)
          }
        })
      })
    })

    return () => subscription.unsubscribe()
  }, [watch, getFieldState, clearErrors, requirements])

  return { ...formMethods, requirements, t }
}
