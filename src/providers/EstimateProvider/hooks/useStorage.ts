import { useCallback } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type FormValues } from '@configs/estimate'
import storageConfig from '@configs/storage'

const { estimateDataKey } = storageConfig

import { setApiValues } from '../utils'

const useStorage = (formMethods: UseFormReturn<FormValues>) => {
  const { getValues } = formMethods

  const saveToStorage = useCallback(() => {
    const formValues = getValues()
    // remove confirmation code from stored data
    delete formValues.contact.confirmationCode
    localStorage.setItem(estimateDataKey, JSON.stringify(formValues))
  }, [getValues])

  const loadFromStorage = useCallback(() => {
    const storedValues = localStorage.getItem(estimateDataKey)
    if (!storedValues) return
    const apiValues = JSON.parse(storedValues)
    setApiValues({ formMethods, apiValues })
  }, [getValues])

  const resetStorage = useCallback(() => {
    localStorage.removeItem(estimateDataKey)
  }, [])

  return { saveToStorage, loadFromStorage, resetStorage }
}

export default useStorage
