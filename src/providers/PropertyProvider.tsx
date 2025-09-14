'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { APIPropertyDetails } from 'services/API'
import { type Property } from 'services/API'
import { restricted, sold } from 'utils/properties'

import { useFeatures } from './FeaturesProvider'
import { useUser } from './UserProvider'

type PropertyContextProps = {
  community?: string
  property: Property
  blurred: boolean
  similarProperties: Property[]
}

const PropertyContext = createContext<PropertyContextProps | undefined>(
  undefined
)

const PropertyProvider = ({
  children,
  property
}: {
  children: React.ReactNode
  property: Property
}) => {
  const { logged } = useUser()
  const features = useFeatures()
  const { mlsNumber, boardId, comparables } = property
  const soldProperty = sold(property)
  const blurred =
    features.blurRestrictedProperty && restricted(property) && !logged

  const [similarProperties, setSimilarProperties] = useState<Property[]>(
    soldProperty && comparables?.length ? comparables : []
  )

  // NOTE: temporary wrapper around APIPropertyDetails "service", which will be deleted soon
  const fetchSimilarListings = useCallback(async () => {
    try {
      const response = await APIPropertyDetails.fetchSimilarListings(
        mlsNumber,
        boardId
      )
      // response from the server sometimes contains properties without mlsNumber
      const filtered = response.similar.filter((p) => Boolean(p.mlsNumber))
      setSimilarProperties(filtered)
    } catch (e) {
      console.error('[SimilarListings] error fetching data', e)
    }
  }, [boardId, mlsNumber, soldProperty])

  useEffect(() => {
    if (!soldProperty) fetchSimilarListings()
  }, [mlsNumber, boardId])

  const contextValue = useMemo(
    () => ({
      property,
      blurred,
      similarProperties
    }),
    [mlsNumber, boardId, blurred, similarProperties]
  )

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  )
}

export default PropertyProvider

export const useProperty = () => {
  const context = useContext(PropertyContext)
  if (!context) {
    throw Error('useProperty must be used within a PropertyProvider')
  }
  return context
}
