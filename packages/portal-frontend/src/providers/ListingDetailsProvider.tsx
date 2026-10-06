/**
 * Owns the listing's detail sections (home details, features, rooms, exterior…),
 * resolved by property class via condo/residential resolvers with a residential default.
 * Exposes `useListingDetails` (read).
 * Anatomy: docs → product-guide/listing-detail/technical
 */
'use client'

import React, { createContext, useContext, useMemo } from 'react'

import { type ApiClassResponse, type ApiListing } from 'services/API'
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
  | 'condominium'
  | 'rooms'

type ResolverSections = Record<DetailsSection, DetailsGroupType[]>

type Resolver = (listing: ApiListing) => ResolverSections

type ClassTypeResolverConfig = Record<ApiClassResponse, Resolver>

type DefaultResolverConfig = {
  default: Resolver
}

type ResolverConfig = Partial<ClassTypeResolverConfig> & DefaultResolverConfig

export const config: ResolverConfig = {
  CondoProperty: condoResolver,
  ResidentialProperty: residentialResolver,
  default: residentialResolver
}

const ListingContext = createContext<ResolverSections | undefined>(undefined)

const ListingDetailsProvider = ({
  children,
  listing
}: {
  children: React.ReactNode
  listing: ApiListing
}) => {
  const { mlsNumber, class: className } = listing
  const contextValue = useMemo(
    () => config[className]?.(listing) || config.default(listing),
    [mlsNumber, className]
  )

  return (
    <ListingContext.Provider value={contextValue}>
      {children}
    </ListingContext.Provider>
  )
}

export const useListingDetails = () => {
  const context = useContext(ListingContext)

  if (!context) {
    throw Error(
      'useListingDetails must be used within a ListingDetailsProvider'
    )
  }

  return context
}

export default ListingDetailsProvider
