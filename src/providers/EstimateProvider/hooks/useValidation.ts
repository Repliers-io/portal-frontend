import { useCallback, useMemo, useState } from 'react'
import { type Path, type UseFormReturn } from 'react-hook-form'

import {
  type FormValues,
  serverValidationFields,
  stepsConfiguration
} from '@configs/estimate'

import { getPaths } from 'utils/path'

const validationFields = Object.values(stepsConfiguration).map(
  (step) => step.validation
)

export type StepValidationState = boolean | undefined

export type ValidationState = {
  status: StepValidationState[]
  maxValidated: number
}

/**
 * useValidation hook
 *
 * Manages validation statuses for form steps.
 * Each step's state can be true, false, or undefined (if not yet validated).
 * When an update is dispatched, the hook updates the status array
 * and recalculates the maxValidated value.
 * Calling resetValidation resets the state to an empty status array and zero maxValidated.
 */
export const useValidation = (formMethods: UseFormReturn<FormValues>) => {
  const {
    trigger,
    setValue,
    getValues,
    resetField,
    formState: { touchedFields, errors }
  } = formMethods

  const [status, setStatus] = useState<StepValidationState[]>([])
  const [maxValidated, setMaxValidated] = useState(0)

  const setStepValidation = useCallback(
    (step: number, valid: StepValidationState) => {
      setStatus((prev) => {
        const newStatus = [...prev]
        newStatus[step] = valid
        setMaxValidated(Math.max(newStatus.lastIndexOf(true), 0))
        return newStatus
      })
    },
    []
  )

  const resetValidation = useCallback(() => {
    setStatus([])
    setMaxValidated(0)
  }, [])

  const resetStepValidation = useCallback((step: number) => {
    const fields = (validationFields[step] || []) as Path<FormValues>[]
    fields.forEach((field) => resetField(field))
    setStepValidation(step, undefined)
  }, [])

  const validateStep = useCallback(
    async (step: number) => {
      const fields = (validationFields[step] || []) as Path<FormValues>[]
      const serverErrors: Partial<Record<Path<FormValues>, string>> = {}

      fields.forEach((field) => {
        const error = errors[field as keyof FormValues]
        if (
          error?.type === 'server' &&
          serverValidationFields.includes(field as any)
        ) {
          serverErrors[field] = error.message
        }
      })

      fields.forEach((field) => {
        if (touchedFields[field as keyof typeof touchedFields]) return
        if (serverErrors[field]) return
        const currentValue = getValues(field)
        setValue(field, currentValue, { shouldTouch: true })
      })

      if (Object.keys(serverErrors).length) {
        setStepValidation(step, false)
        return false
      }

      const valid = await trigger(fields)
      setStepValidation(step, valid)
      return valid
    },
    [errors, touchedFields]
  )

  const validateSteps = useCallback(
    (maxStep: number) => {
      Array.from({ length: maxStep }).forEach((_, i) => validateStep(i))
    },
    [validateStep]
  )

  const getStepErrors = useCallback(
    (step: number) => {
      const errorArr = getPaths(errors, 2)
      const fields = validationFields[step] || []
      return fields.filter((f) => errorArr?.includes(f)) || []
    },
    [errors]
  )

  const validation = useMemo<ValidationState>(
    () => ({
      status,
      maxValidated
    }),
    [status, maxValidated]
  )

  return {
    validation,
    validateStep,
    validateSteps,
    resetValidation,
    getStepErrors,
    setStepValidation,
    resetStepValidation
  }
}

export default useValidation
