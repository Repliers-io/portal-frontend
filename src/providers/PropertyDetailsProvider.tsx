'use client'

import React, { createContext, useContext, useMemo } from 'react'

import { type ApiClassResponse, type Property } from 'services/API'
import {
  condoResolver,
  type DetailsGroupType,
  residentialResolver
} from 'utils/dataMapper'

type DetailsSection =
  | 'homeDetails'
  | 'features'
  | 'appliances'
  | 'neighborhood'
  | 'exterior'
  | 'rooms'

type ResolverSections = {
  [key in DetailsSection]: DetailsGroupType[]
}

type Resolver = (property: Property) => ResolverSections

type ClassTypeResolverConfig = {
  [key in ApiClassResponse]: Resolver
}

type DefaultResolverConfig = {
  default: Resolver
}

type ResolverConfig = Partial<ClassTypeResolverConfig> & DefaultResolverConfig

export const config: ResolverConfig = {
  CondoProperty: condoResolver,
  ResidentialProperty: residentialResolver,
  default: residentialResolver
}

const PropertyContext = createContext<ResolverSections | undefined>(undefined)

const PropertyDetailsProvider = ({
  children,
  property
}: {
  children: React.ReactNode
  property: Property
}) => {
  const { mlsNumber, class: className } = property
  const contextValue = useMemo(
    () => config[className]?.(property) || config.default(property),
    [mlsNumber, className]
  )

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  )
}

export const usePropertyDetails = () => {
  const context = useContext(PropertyContext)

  if (!context) {
    throw Error(
      'usePropertyDetails must be used within a PropertyDetailsProvider'
    )
  }

  return context
}

export default PropertyDetailsProvider
