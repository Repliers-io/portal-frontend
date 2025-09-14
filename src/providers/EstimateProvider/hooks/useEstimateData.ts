import { useState } from 'react'
import { type Path, type UseFormReturn } from 'react-hook-form'

import {
  type EstimateData,
  type EstimatePayload,
  type FormValues,
  stepsConfiguration
} from '@configs/estimate'

import { APIEstimate } from 'services/API'
import { useSelectOptions } from 'providers/SelectOptionsProvider'
import { useUser } from 'providers/UserProvider'

import {
  cleanApiData,
  cleanFormData,
  cleanFormSelects,
  setApiValues
} from '../utils'

const extractFinancialData = (payload: EstimatePayload) => {
  const { data: { purchasePrice, purchaseDate, mortgage } = {} } = payload
  return {
    purchasePrice,
    purchaseDate,
    mortgage
  }
}

const useEstimateData = (
  formMethods: UseFormReturn<FormValues>,
  signature?: string
) => {
  const { agentRole, logged } = useUser()
  const { setError, setValue, getValues } = formMethods
  const { options } = useSelectOptions()
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [errorCode, setErrorCode] = useState<number>(200)
  const [errorSteps, setErrorSteps] = useState<number[]>([])
  const [errorParams, setErrorParams] = useState<Path<FormValues>[]>([])
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null)
  const [financialData, setFinancialData] = useState<any | null>(null)

  const validationFields = Object.values(stepsConfiguration).map(
    (step) => step.validation
  )

  const setFormErrors = (params: Path<FormValues>[]) => {
    // set server error messages to fields
    params.forEach((param) => {
      setError(param, { type: 'server', message: 'Server error' })
    })

    // find form steps with error fields
    const errorSteps: number[] = []
    validationFields.forEach((stepFields, stepIndex) => {
      // Find all fields that match
      const matched = stepFields.filter((field) =>
        params.includes(field as Path<FormValues>)
      )
      if (matched.length > 0) {
        errorSteps.push(stepIndex)
      }
    })

    // set state
    setErrorParams(params)
    setErrorSteps(errorSteps)
  }

  const postEstimate = async (estimateId?: number) => {
    const values = getValues()
    try {
      setErrorCode(200)
      setErrorSteps([])
      setErrorParams([])
      setCalculating(true)

      const clientId = getValues('clientId')
      const params = cleanFormData({
        data: cleanFormSelects(values, options),
        logged,
        clientId,
        estimateId
      })

      const data = await (clientId && agentRole
        ? APIEstimate.postAgentEstimate(params, clientId, estimateId, signature)
        : APIEstimate.postEstimate(params, estimateId)) // there is no way we would use clients endpoint with signature

      setEstimateData(data)
      setFinancialData(extractFinancialData(data.payload!))
      return data
    } catch (error: any) {
      setErrorCode(error.status)
      const errorInfo = error?.data?.info
      const errorMessage = error?.data?.message
      if (Array.isArray(errorInfo)) {
        setFormErrors(errorInfo.map((e) => e.param))
      } else if (errorMessage) {
        const match = errorMessage.match(/["']([^"']+)["']/)
        if (match) {
          setFormErrors([match[1]])
        } else {
          // Optionally show a generic error here
          // console.log('errorMessage', errorMessage)
        }
      }
    } finally {
      setCalculating(false)
    }
  }

  const resetEstimateData = () => {
    setEstimateData(null)
    setErrorParams([])
  }

  const fetchEstimate = async (id: number | string) => {
    try {
      setLoading(true)
      const isUlid = String(id).length > 10 // TODO: think about better way to check if ulid or estimateId
      const data = await APIEstimate.fetchEstimate(id, isUlid)
      if (data?.payload) {
        const apiValues = cleanApiData(data.payload)
        setFinancialData(extractFinancialData(data.payload))
        setApiValues({ formMethods, apiValues })
        setValue('point', data.payload.map)
        setEstimateData({
          ...data,
          payload: {
            ...data.payload,
            // save cleaned / sanitized data to estimateData
            ...(apiValues as unknown as EstimatePayload)
          }
        })
        setErrorCode(200)
        return data
      }
      setErrorCode(404)
      return null
    } catch (error: any) {
      setErrorCode(error.status)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading, // loading estimate data
    calculating, // posting/patching estimate data
    errorCode,
    errorSteps,
    errorParams,
    estimateData,
    financialData,
    postEstimate,
    fetchEstimate,
    resetEstimateData
  }
}

export default useEstimateData
