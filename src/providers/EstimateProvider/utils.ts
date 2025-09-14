import { type UseFormReturn } from 'react-hook-form'

import apiConfig from '@configs/api'
import {
  type EstimateData,
  type EstimateListingType,
  type EstimateStepName,
  type FormValues,
  protectedDataFields,
  stepsConfiguration
} from '@configs/estimate'
import {
  basicFieldsToRemove,
  condoFieldsToRemove,
  emptyExceptions,
  residentialFieldsToRemove
} from '@configs/estimate'
import { listingTypeMappings } from '@configs/estimate'
import { TYPE_RESIDENTIAL } from '@configs/filter-types'

import { type ApiEstimateParams } from 'services/API'
import { toSafeNumber } from 'utils/formatters'
import { deriveArea, SQFT_PER_ACRE } from 'utils/numbers'
import { getPath, getPaths, removePaths, setPath } from 'utils/path'
import { getCDNPath } from 'utils/urls'

const propertyTypeMappings: Record<string, EstimateListingType> = {}
Object.entries(listingTypeMappings).forEach(([key, value]) => {
  value.forEach((type) => {
    propertyTypeMappings[type] = key as EstimateListingType
  })
})

export const convertApiValueType = (originalValue: any, apiValue: any): any => {
  if (Array.isArray(originalValue) && Array.isArray(apiValue)) {
    // Assuming that the type of the first element in the array is the same for all elements
    if (originalValue.length === 0) {
      // If originalValue array is empty, return apiValue as is
      return apiValue
    }
    return apiValue.map((item) => convertApiValueType(originalValue[0], item))
  }

  const originalValueType = typeof originalValue

  switch (originalValueType) {
    case 'number': {
      const numericValue = Number(apiValue)
      if (isNaN(numericValue)) {
        return apiValue
      }
      if (Number.isInteger(originalValue)) {
        return Math.round(numericValue)
      }
      return numericValue
    }

    case 'string':
      return String(apiValue)

    case 'boolean':
      return Boolean(apiValue)

    case 'object':
      if (originalValue === null) {
        return apiValue
      }
      // If it's an object, recursively convert nested fields
      if (typeof apiValue === 'object' && apiValue !== null) {
        const formKeys = Object.keys(originalValue)
        if (formKeys.length === 0) {
          // If originalValue is an empty object, return apiValue as is
          return apiValue
        }

        const convertedObject: any = {}
        for (const key in originalValue) {
          // Using Object.hasOwn from ES2022
          if (
            Object.hasOwn(originalValue, key) &&
            Object.hasOwn(apiValue, key)
          ) {
            convertedObject[key] = convertApiValueType(
              originalValue[key],
              apiValue[key]
            )
          }
        }
        return convertedObject
      }
      return apiValue

    default:
      return apiValue
  }
}

export const setApiValues = ({
  formMethods,
  apiValues
}: {
  formMethods: UseFormReturn<FormValues>
  apiValues: EstimateData | Partial<FormValues>
}) => {
  const { setValue, getValues } = formMethods
  const formValues = getValues()
  const allPaths = getPaths(formValues)

  allPaths.forEach((path) => {
    const apiValue = getPath(apiValues, path)
    if (apiValue !== undefined) {
      const formValue = getPath(formValues, path)
      const convertedValue = convertApiValueType(formValue, apiValue)
      setValue(path as keyof FormValues, convertedValue, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  })
}

/**
 * Recursively removes keys with values 0, '' or `null` from an object, except for specified paths
 * @param obj The object to clean
 * @param exclude Array of paths to exclude from cleaning
 * @returns A new object with specified keys removed
 */
/* eslint-disable no-continue */
export const removeFalsyValues = (obj: any, exclude: string[] = []) => {
  const pathExcluded = (currentPath: string): boolean => {
    return exclude.some((excludePath) => currentPath === excludePath)
  }

  const processObject = (currentObj: any, parentPath: string = '') => {
    if (Array.isArray(currentObj)) {
      return currentObj.filter(
        (item) => item !== '' && item !== 0 && item !== null
      )
    }

    const processed: any = {}

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in currentObj) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key
      const value = currentObj[key]

      if (pathExcluded(currentPath)) {
        processed[key] = value
        continue
      }

      if (value === '' || value === 0 || value === null) continue

      if (typeof value === 'object' && value !== null) {
        const nestedResult = processObject(value, currentPath)
        // remove the whole branch if it's empty
        if (
          Array.isArray(nestedResult)
            ? nestedResult.length > 0
            : Object.keys(nestedResult).length > 0
        ) {
          processed[key] = nestedResult
        }
      } else {
        processed[key] = value
      }
    }
    return processed
  }

  return processObject(obj)
}

export const cleanFormSelects = (
  values: FormValues,
  options: Record<string, any>
): FormValues => {
  let cleaned = { ...values }

  Object.entries(options).forEach(([key, optionValues]) => {
    const value = getPath(cleaned, key)
    if (value) {
      if (Array.isArray(value)) {
        const lowerCaseValues = value.map((v: string) => v.toLowerCase())
        const filteredValues = lowerCaseValues
          .filter((v) => optionValues.includes(v))
          .slice(0, 10)
        cleaned = setPath(cleaned, key, filteredValues)
      } else {
        // null value if there is no match with options
        if (!optionValues.includes(value.toLowerCase()))
          cleaned = setPath(cleaned, key, null)
      }
    }
  })

  return cleaned
}

const partialRemove = (obj: any, paths: string[]): void => {
  paths.forEach((path) => {
    const key = getPath(obj, path)
    if (key !== undefined) {
      delete obj[key]
    }
  })
}

/**
 * Cleans OUTGOING data from the form before pushing it to the API
 * Creates a new object without modifying the original form values
 */
export const cleanFormData = ({
  data,
  logged,
  clientId,
  estimateId
}: {
  data: FormValues
  logged: boolean // some portal instances allow to create estimates without login
  clientId?: number // clientId should be passed if there is agent editing or posting estimate
  estimateId?: number // estimateId will be passed if we are editing existing estimate
}) => {
  // Create deep copy using structuredClone
  const copy = structuredClone(data)

  const condo = copy.listingType === 'condo'
  // unitNumber stays as a separate field in the form due to
  // the process of 'address' section server-side validation,
  // but should be moved inside of it for the API calls
  if (copy.unitNumber && copy.address) copy.address.unitNumber = copy.unitNumber

  if (copy.lot?.sqft) {
    copy.lot.acres = String(copy.lot.sqft / SQFT_PER_ACRE)
  }
  copy.details.propertyType =
    listingTypeMappings[copy.listingType]?.[0] || TYPE_RESIDENTIAL[0]

  const removeFields = [
    ...basicFieldsToRemove,
    ...(condo ? condoFieldsToRemove : residentialFieldsToRemove),
    // remove fields that are not needed for PATCH requests
    estimateId ? 'boardId' : '',
    // agents should not trigger email sending for new estimates
    clientId ? 'sendEmailNow' : '',
    // some portal instances allow to create estimates without login
    ...(logged ? ['sendEmailMonthly', 'sendEmailNow'] : [])
  ].filter(Boolean)

  const cleaned: Partial<FormValues> = removePaths(copy, removeFields)

  // manual cleaning for PATCH case after removePaths
  if (estimateId) {
    if (protectedDataFields.length) {
      // partial removal of 'data' section for make available mortgage fields
      partialRemove(cleaned, protectedDataFields)
    } else {
      // 'data' section can not be updated
      delete cleaned.data
    }
  }

  const truthy = removeFalsyValues(
    cleaned,
    emptyExceptions
  ) as ApiEstimateParams

  return truthy
}

/**
 * Merges properties ending with 2-9 into the corresponding property ending with 1.
 * Converts the target property to an array if it's a string.
 * @param details The object containing the properties to process.
 */
export const mergeRepeatedProperties = (
  details: Record<string, string | string[]>
) => {
  const result = { ...details }

  Object.keys(details).forEach((key) => {
    const match = key.match(/(.+)[2-9]$/) // Match keys ending with 2-9
    if (match) {
      const baseKey = match[1] // Extract the base key (e.g., "propertyName" from "propertyName2")
      const targetKey = `${baseKey}1` // Target key to merge into (e.g., "propertyName1")
      const prevValue = result[targetKey]
      if (prevValue) {
        result[targetKey] = [...[prevValue], ...[result[key]]].flat()
        delete result[key]
      }
    }
  })

  return result
}
/**
 * Splits comma-separated string or array values into arrays for specified keys in an object.
 *
 * For each key in the input object:
 *   - If the value is a string containing commas, it will be split into an array of trimmed strings.
 *   - If the value is an array, each string element containing commas will be split into arrays of trimmed strings, and the result will be flattened.
 *   - If `multivalueKeys` is provided and not empty, only those keys will be processed. If `multivalueKeys` is empty, all keys in the object will be processed.
 *
 * @param source - The source object with string or string[] values.
 * @param multivalueKeys - An optional array of keys to process. If empty, all keys are processed.
 * @returns A new object with specified keys' values split into arrays where applicable.
 */
export const splitCommaValues = (
  source: Record<string, string | string[]>,
  multivalueKeys: string[] = []
): Record<string, string | string[]> => {
  if (!source || typeof source !== 'object') return {}
  const result = { ...source }

  const keys = Object.keys(source).filter((key) => {
    return !multivalueKeys.length || multivalueKeys.includes(key)
  })

  const splitByComma = (v: string) => v.split(',').map((s) => s.trim())

  keys.forEach((key) => {
    const value = source[key]
    if (typeof value === 'string' && value.includes(',')) {
      result[key] = Array.from(new Set(splitByComma(value)))
    } else if (Array.isArray(value)) {
      const splitValues = value.map((v) =>
        typeof v === 'string' && v.includes(',') ? splitByComma(v) : v
      )
      result[key] = Array.from(new Set(splitValues.flat()))
    }
  })
  return result
}

const trimMultiValue = (value: string | number | null | undefined) =>
  String(value).split(',')[0]

/**
 * Cleans INCOMING dirty data from the API before setting it to the form
 * Creates a new object without modifying the original API data
 */
export const cleanApiData = (data: any): Partial<FormValues> => {
  // Create deep copy using structuredClone
  const copy = structuredClone(data)

  const [lotWidth, lotDepth, lotArea] = deriveArea(
    Math.round(toSafeNumber(copy.lot.width)),
    Math.round(toSafeNumber(copy.lot.depth)),
    toSafeNumber(copy.lot.acres),
    toSafeNumber(copy.lot.squareFeet)
  )

  const homeSize =
    Number(String(copy.details.sqft).match(/(\d+(\.\d+)?)$/)?.[0]) || 1000
  const homeStyle = trimMultiValue(copy.details.style)

  const annualTaxesAmount = Math.round(copy.taxes?.annualAmount)
  const condoMaintenanceFees = Math.round(copy.condominium?.fees?.maintenance)

  let listingType: EstimateListingType = 'residential'

  const typeMapping = propertyTypeMappings[copy?.details?.propertyType]
  if (typeMapping) {
    listingType = typeMapping
  } else {
    // if no `propertyType` matching, check the class as a fallback
    if (copy.class?.toLowerCase().replace('property', '') === 'condo') {
      listingType = 'condo'
    }
    // otherwise, use `residential` as a default
  }

  // WARN: hardcoded fix for Calgary MLS issue
  copy.address.neighborhood =
    copy.address.neighborhood === 'NONE' ? '' : copy.address.neighborhood

  // extract imageUrl with two possible variants
  // TODO: Verify if the first variant (copy.images?.[0]) is still relevant; consider removing it if no longer needed in future updates.
  const rawImgUrl = copy.images?.[0] || copy?.data?.imageUrl

  // convert rawImgUrl to CDN path or keep it as is if it already contains CDN
  const imageUrl =
    rawImgUrl && !rawImgUrl.includes(apiConfig.repliersCdn)
      ? getCDNPath(rawImgUrl)
      : rawImgUrl

  const cleaned = {
    ...copy,
    listingType,
    details: {
      // merge props ending with `xxxxxx[2-9]` into the `xxxxxx1` as array
      ...mergeRepeatedProperties(splitCommaValues(copy.details)),
      // interior size
      sqft: homeSize,
      style: homeStyle
    },
    data: {
      ...copy.data,
      // clear all sensitive financial information from the
      purchasePrice: undefined,
      purchaseDate: undefined,
      mortgage: {
        balance: undefined
      },
      imageUrl
    },
    lot: {
      ...copy.lot,
      width: lotWidth,
      depth: lotDepth,
      acres: lotArea
    },
    taxes: {
      ...copy.taxes,
      annualAmount: annualTaxesAmount
    },
    condominium: {
      ...splitCommaValues(copy.condominium),
      fees: {
        maintenance: condoMaintenanceFees
      }
    }
  }

  const truthy = removeFalsyValues(cleaned, emptyExceptions)
  // remove empty values from the object
  return truthy
}

/**
 * Returns the list of step names for the estimate flow,
 * applying rules for agentRole, logged-in user, and clientId.
 */
export const getStepNames = ({
  agentRole,
  logged,
  clientId
}: {
  agentRole: boolean
  logged: boolean
  clientId?: number
}): EstimateStepName[] => {
  return Object.keys(stepsConfiguration).reduce<EstimateStepName[]>(
    (acc, key) => {
      // skip confirmation for logged-in users or agents
      if ((logged || agentRole) && key === 'confirmation') return acc
      // skip contact step for logged-in users (NOT agents)
      if (logged && !agentRole && key === 'contact') return acc
      // no contact step when clientId is provided
      if (clientId && key === 'contact') return acc

      return acc.concat(key as EstimateStepName)
    },
    []
  )
}

/**
 * Returns the number of data steps (excluding contact/confirmation).
 * Optionally skips the address step if login is needed.
 */
export const getDataSteps = (
  stepNames: EstimateStepName[],
  loginNeeded: boolean
): number => {
  return stepNames.filter((stepName) => {
    // skip address step if login is needed (logged‐in users)
    if (stepName === 'address' && loginNeeded) return false
    // always exclude contact & confirmation steps from data count
    return !['contact', 'confirmation'].includes(stepName)
  }).length
}
