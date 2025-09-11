'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import {
  type EstimateData,
  type EstimateStepName,
  type FormValues
} from '@configs/estimate'
import { defaultValues } from '@configs/estimate'
import { schema } from '@configs/estimate'
import { joiResolver } from '@hookform/resolvers/joi'

import { useUser } from 'providers/UserProvider'
import useDebounce from 'hooks/useDebounce'
import useSnackbar from 'hooks/useSnackbar'

import {
  useClientRegistration,
  useEstimateData,
  useEstimateUrl,
  useHistoryData,
  useOtpAuth,
  useStorage,
  useValidation,
  type ValidationState
} from './hooks'
import { getDataSteps, getStepNames } from './utils'

type EstimateContextType = {
  step: number
  steps: number
  stepNames: EstimateStepName[]
  route: 'post' | 'patch' | 'result'
  editing: boolean
  loading: boolean // ANY async operation
  preloading: boolean // first time / initial data loading
  calculating: boolean // estimate calculation (last step)
  defaultValues: FormValues
  validation: ValidationState
  historyData: Partial<EstimateData> | null
  initiallyLogged: boolean
  clientId?: number
  signature?: string
  financialData: {
    purchasePrice?: number
    purchaseDate?: string
    mortgage?: any
  } | null
  estimateData: EstimateData | null
  estimateError: number | null
  estimateId?: number | string
  nextStep: () => void
  prevStep: () => void
  showStep: (step: number, skipValidation?: boolean) => void
  getStepErrors: (step: number) => string[]
  resetForm: () => void
  requestLogin: () => void
}

export const EstimateContext = createContext<EstimateContextType | null>(null)

const EstimateProvider = ({
  params = 'route',
  step: paramsStep = 0,
  clientId: paramClientId,
  estimateId: paramsEstimateId,
  embedded = false,
  signature,
  rest = {},
  children
}: {
  params?: 'get-params' | 'route'
  step?: number
  clientId?: number
  estimateId?: number | string
  signature?: string
  embedded?: boolean // if true, then we are in the embedded context
  rest?: Record<string, string>
  children: React.ReactNode
}) => {
  const { showSnackbar } = useSnackbar()
  const { logged, profile, agentRole, userRole } = useUser()

  const initiallyLogged = useRef(logged)
  const [step, setStep] = useState(paramsStep > 4 ? 0 : paramsStep) // max step from URL is 4
  const [clientId, setClientId] = useState(paramClientId)
  const [estimateId, setEstimateId] = useState(paramsEstimateId)
  const { updateEstimateUrl } = useEstimateUrl(
    params,
    clientId,
    signature,
    rest
  )

  // CUSTOM ROUTING
  // `post` means client fills in the form for new/unknown/unidentified property
  // `patch` is the data editing for existing estimate
  // `result` to show the final screen

  // TODO: make this calculation dependent on the URL params
  // see WARN comment in the useEffect [paramsStep]
  const [route, setRoute] = useState<EstimateContextType['route']>(
    estimateId ? (step > 0 ? 'patch' : 'result') : 'post'
  )

  // we need formMethods to pass them as-is to several custom hooks
  const formMethods = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
      sendEmailMonthly: userRole || !logged,
      clientId
    },
    mode: 'onBlur', // do not validate on typing
    shouldFocusError: false, // do not auto-focus on errors
    resolver: joiResolver(schema)
  })

  const { watch, reset } = formMethods
  const { loadFromStorage, saveToStorage, resetStorage } =
    useStorage(formMethods)

  const {
    historyData,
    fetchHistory,
    loading: historyLoading
  } = useHistoryData(formMethods)

  const { loading: registrationLoading, registerClient } =
    useClientRegistration(formMethods)

  // each step has THREE states of validation status: true, false, undefined
  // where `undefined` means the step is not reached yet
  const {
    validation,
    validateStep,
    validateSteps,
    resetValidation,
    setStepValidation,
    getStepErrors
  } = useValidation(formMethods)

  const {
    loading: estimateLoading,
    calculating,
    errorSteps,
    errorCode,
    estimateData,
    financialData,
    postEstimate,
    fetchEstimate,
    resetEstimateData
  } = useEstimateData(formMethods, signature)

  const {
    requestLogin,
    confirmLogin,
    loading: codeLoading
  } = useOtpAuth(formMethods)

  const editing = Boolean(
    logged &&
      // logged-in user is editing their own estimate
      (profile.clientId === estimateData?.clientId ||
        // we are editing the estimate for the client of the agent
        (agentRole && estimateId && estimateData?.clientId))
  )

  const stepNames = useMemo(
    () => getStepNames({ agentRole, logged, clientId }),
    [agentRole, logged, clientId]
  )

  // `loginNeeded` flag should be set to 'true' on the `confirmationStep`
  // only if we have a OTP confirmation in the flow
  const confirmationNeeded = stepNames.includes('confirmation') && !agentRole // no confirmation for agents estimates
  const loginNeeded = confirmationNeeded && !logged && !agentRole // no auth for agents estimates

  const steps = stepNames.length // old alias
  const dataSteps = useMemo(
    () => getDataSteps(stepNames, loginNeeded),
    [stepNames, loginNeeded]
  )

  const prevAddress = useRef('')
  const address = watch('address')
  const unitNumber = useDebounce(watch('unitNumber'), 800)

  const resetForm = () => {
    setStep(0)
    setRoute('post')
    resetValidation()
    resetEstimateData()
    setEstimateId(undefined)
    prevAddress.current = '' // reset address cache

    reset() // react-hook-form reset
    resetStorage()
  }

  const processEstimateData = async () => {
    const previousId = editing ? estimateData?.estimateId : undefined
    const newData = await postEstimate(previousId)
    if (newData) {
      setEstimateId(newData.ulid || newData.estimateId)
      setRoute('result')
      setStep(0) // reset step to 0
      return true
    } else {
      showSnackbar('Failed to calculate estimate', 'error')
      // eslint-disable-next-line no-use-before-define
      showStep(dataSteps - 1) // "intentions step" becomes the last one after successful login
      return false
    }
  }

  const showStep = async (newStep: number, skipValidation = false) => {
    if (estimateId) setRoute('patch')
    if (editing && !newStep) setRoute('result')

    if (!skipValidation) {
      const valid = await validateStep(step) // validate the old / current step
      // block them going further in form but allow to go back
      // to the previous step even when there is an error in the current one
      if (route !== 'result' && newStep > step && !valid) return
    }

    const lastStep = newStep >= steps
    const confirmationStep = stepNames[newStep] === 'confirmation'

    if (confirmationStep && loginNeeded && !logged && !(await requestLogin()))
      return

    // WARN: `processEstimateData` function is basically a GOTO operator to jump over the auth step to the result
    if (lastStep && confirmationNeeded && !logged) {
      if (await confirmLogin()) {
        processEstimateData()
      }
      return
    }

    // alternative flow for agents creating estimates for new clients
    if (lastStep && agentRole && !clientId) {
      const newClientId = await registerClient()
      if (!newClientId) return
      setClientId(newClientId)
    }

    if (lastStep) {
      await processEstimateData()
      return
    }

    setStep(newStep)
  }

  const prevStep = () => showStep(step - 1)
  const nextStep = () => showStep(step + 1)

  const fetchEstimateData = async () => {
    const result = await fetchEstimate(estimateId!)
    if (result) {
      // validate all _data_ steps, but do not touch contacts/otp
      validateSteps(dataSteps)
      if (step > 0) setRoute('patch')
    }
  }

  const fetchHistoryData = async () => {
    try {
      await fetchHistory()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showSnackbar('Failed to fetch address information', 'error')
    }
  }

  // restore fields from storage
  useEffect(() => {
    // estimate page was loaded with the step in the URL
    if (!estimateId && step > 0) {
      loadFromStorage()
      validateSteps(step) // max step
    }
  }, [])

  // sync step state value with the URL params
  useEffect(() => {
    const newStep = paramsStep > 4 ? 0 : paramsStep // max step is 4
    setStep(newStep)
    // WARN: route value does not change when new `step` is passed in the URL
    // but we need to show the result screen when the `estimateId` is present
    if (estimateId && newStep === 0) setRoute('result')
  }, [paramsStep])

  // fetch history data as soon as the address appeared
  useEffect(() => {
    const { fullAddress } = address || {}
    if (
      step === 0 &&
      !estimateId &&
      fullAddress &&
      prevAddress.current !== fullAddress + unitNumber
    ) {
      fetchHistoryData()
      prevAddress.current = fullAddress + unitNumber
    }
  }, [estimateId, step, address?.fullAddress, unitNumber])

  // fetch data for estimateId (which could be updated by internal state!)
  useEffect(() => {
    if (estimateId && !estimateData) fetchEstimateData()
  }, [estimateId, estimateData])

  // sync UI with URL
  useEffect(() => {
    if (step > 0) saveToStorage()
    if (!embedded) updateEstimateUrl(estimateId, step)
  }, [step, estimateId, clientId])

  useEffect(() => {
    if (errorSteps.length) {
      showStep(errorSteps[0], true) // `true` to skip form's native validation
      errorSteps.forEach((errorStep) => setStepValidation(errorStep, false))
    }
  }, [errorSteps])

  useEffect(() => {
    if (estimateId && editing) {
      const { setValue } = formMethods
      setValue('data.purchasePrice', financialData?.purchasePrice)
      setValue('data.purchaseDate', financialData?.purchaseDate)
      setValue('data.mortgage', financialData?.mortgage)
    }
  }, [editing, estimateId])

  const preloading = historyLoading || estimateLoading
  const loading =
    preloading || calculating || codeLoading || registrationLoading

  const contextValue = useMemo(
    () => ({
      step,
      steps,
      stepNames,
      route,
      signature,
      loading,
      editing,
      validation,
      preloading,
      calculating,
      defaultValues,
      initiallyLogged: initiallyLogged.current,
      clientId, // needed for agents to create estimates for their existing clients
      historyData,
      financialData,
      estimateData,
      estimateError: errorCode < 300 ? null : errorCode,
      estimateId,
      showStep,
      nextStep,
      prevStep,
      getStepErrors,
      resetForm,
      requestLogin
    }),
    [
      step,
      steps,
      signature,
      errorCode,
      validation,
      calculating,
      codeLoading,
      historyLoading,
      estimateLoading,
      registrationLoading
    ]
  )

  return (
    <EstimateContext.Provider value={contextValue}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </EstimateContext.Provider>
  )
}

export default EstimateProvider

export const useEstimate = () => {
  const context = useContext(EstimateContext)
  if (!context) {
    throw Error('useEstimate must be used within a EstimateProvider')
  }

  return context
}
