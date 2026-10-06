import type React from 'react'
import { type RegisterOptions, useFormContext } from 'react-hook-form'

type UseFormFieldReturn<T> = {
  name: string
  value: T
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  ref: React.Ref<HTMLInputElement>
  error: boolean
  helperText?: string
}

const useFormField = <T = string | number>(
  name: string,
  options?: RegisterOptions
): UseFormFieldReturn<T> => {
  const {
    register,
    watch,
    formState: { errors, touchedFields, submitCount }
  } = useFormContext()

  const fieldRegister = register(name, { ...options })
  const value = watch(name)

  const getNestedError = (errorsObject: any, path: string) =>
    path
      .split('.')
      .reduce((obj, key) => (obj ? obj[key] : undefined), errorsObject)

  const getNestedTouched = (touchedObject: any, path: string) =>
    path
      .split('.')
      .reduce((obj, key) => (obj ? obj[key] : undefined), touchedObject)

  const fieldError = getNestedError(errors, name)
  const touched = getNestedTouched(touchedFields, name)

  const errorMessage = fieldError?.message

  const shouldShowError = !!fieldError && (touched || submitCount > 0)

  return {
    name: fieldRegister.name,
    value: value ?? (typeof value === 'number' ? 0 : ''),
    onChange: fieldRegister.onChange,
    onBlur: fieldRegister.onBlur,
    ref: fieldRegister.ref,
    error: shouldShowError,
    helperText: shouldShowError ? errorMessage : undefined
  }
}

export default useFormField
