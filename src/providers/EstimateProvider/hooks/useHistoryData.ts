import { useState } from 'react'
import deepmerge from 'deepmerge'
import { type UseFormReturn } from 'react-hook-form'

import {
  addStreetSuffix,
  defaultValues,
  type EstimateData,
  type FormValues
} from '@configs/estimate'
import {
  TYPE_MULTI_FAMILY,
  TYPE_SEMIDETACHED,
  TYPE_TOWNHOME
} from '@configs/filter-types'

import { type ApiAddress, APIEstimate } from 'services/API'
import { MapSearch } from 'services/Map'
import { useFeatures } from 'providers/FeaturesProvider'

import { cleanApiData, setApiValues } from '../utils'

const notResidentialErrorMessage =
  'The address provided is not a residential property'

const homeClasses = ['CondoProperty', 'ResidentialProperty']
const multiTypes = [TYPE_MULTI_FAMILY, TYPE_SEMIDETACHED, TYPE_TOWNHOME]
  .flat()
  .map((type) => String(type).toLowerCase())

const useHistoryData = (formMethods: UseFormReturn<FormValues>) => {
  const features = useFeatures()
  const [historyData, setHistoryData] = useState<Partial<EstimateData> | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const { setError, clearErrors, getValues, setValue } = formMethods

  const fetchAddressData = async (address: ApiAddress, unitNumber?: string) => {
    const {
      city,
      streetName,
      streetNumber,
      streetDirection,
      streetSuffixFull
    } = address
    return await APIEstimate.fetchPropertyDetails({
      city,
      unitNumber,
      streetName,
      streetNumber,
      streetDirection,
      streetSuffix: addStreetSuffix ? streetSuffixFull : undefined
    })
  }

  const setErrorMessage = (message: string) => {
    if (message) {
      setError('address', { type: 'server', message })
      setValue('point', undefined)
    } else {
      clearErrors('address')
    }
  }

  const fetchHistory = async () => {
    const [address, unitNumber] = getValues(['address', 'unitNumber'])
    if (!address) return null

    setLoading(true)

    try {
      setHistoryData(null)
      setErrorMessage('') // reset error message

      const fetchPoint =
        features.searchProvider === 'google'
          ? MapSearch.fetchGmapsAddressPoint
          : MapSearch.fetchMapboxAddressPoint

      /**
       * Fetch property data and coordinates in parallel
       *
       * The point fetch is crucial for Google Places integration because:
       * 1. Google's autocomplete API doesn't provide zip codes in address responses
       * 2. We need to make a separate Places Details API call to get complete address_components
       * 3. The zip code extracted from this call is then merged into both the form data
       *    and the property history data for complete address information storage
       */
      const [property, point] = await Promise.allSettled([
        fetchAddressData(address, unitNumber),
        fetchPoint(address)
      ])

      // Set point coordinates and handle zip code extraction
      if (point.status === 'fulfilled') {
        setValue('point', point.value)

        /**
         * Handle zip code from Google Places Details API response
         *
         * WARN: Since Google's autocomplete doesn't include zip codes, we extract them
         * from the Places Details API call and update the form's address field
         */
        if (point.value?.zip) {
          const currentAddress = getValues('address')
          if (currentAddress) {
            setValue('address', {
              ...currentAddress,
              zip: point.value.zip
            })
          }
        }
      } else {
        setValue('point', undefined)
      }

      // If propertyData failed, just skip property logic, but still allow point to be set
      if (property.status !== 'fulfilled' || !property.value) {
        // If the user entered unitNumber, we still want to keep listingType
        if (unitNumber) setValue('listingType', 'condo')
        return null
      }

      const propertyData = property.value

      /**
       * Merge zip code from Places API into property data
       *
       * WARN: This ensures the zip code extracted from Google Places Details API
       * is preserved in the property history data, since the original property
       * data from autosuggest does not include it.
       */
      if (point.status === 'fulfilled' && point.value?.zip) {
        propertyData.address.zip = point.value.zip
      }

      setHistoryData(propertyData) // cache history data internally

      let apiValues: any
      const propertyClass = propertyData.class

      if (propertyClass) {
        const propertyType = propertyData.details.propertyType.toLowerCase()
        if (
          !homeClasses.includes(propertyClass) &&
          !multiTypes.includes(propertyType)
        ) {
          setErrorMessage(notResidentialErrorMessage)
          return null
        }
        // NOTE: mapbox address will be completelly replaced by property history data
        apiValues = cleanApiData(propertyData)
      } else {
        // NOTE: mapbox address is already here as its update initiated the fetch,
        // BUT autosuggest answers _DO_NOT_ contain the `neighborhood` field, so
        // we need to merge it with a "partial history data" (which is NOT an
        // actual history data but two fields only (`city`, `neighborhood`))
        apiValues = deepmerge(defaultValues, {
          ...propertyData,
          // WARN: we are making assumption here that the property is a condo
          ...(unitNumber && { unitNumber, listingType: 'condo' })
        })
      }
      setApiValues({ formMethods, apiValues })

      return propertyData
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    historyData,
    fetchHistory
  }
}

export default useHistoryData
