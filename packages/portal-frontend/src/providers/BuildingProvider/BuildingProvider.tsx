/**
 * React context provider exposing a single CMS building/condo record.
 * Wraps children in BuildingContext and offers the `useBuilding` hook, which
 * throws when consumed outside the provider.
 * Anatomy: docs → product-guide/cms-content/technical
 */
'use client'

import React, { createContext, useContext } from 'react'

import { type Building } from 'utils/buildings/types'

export type CmsBuilding = {
  id: number
  name: string
  slug: string
  description?: string
  yoast_head_json?: any
  acf?: any
  _embedded?: any
}

const BuildingContext = createContext<Building | undefined>(undefined)

export const useBuilding = () => {
  const context = useContext(BuildingContext)
  if (!context) {
    throw new Error('useBuilding must be used within BuildingProvider')
  }
  return context
}

type BuildingProviderProps = {
  building: Building
  children: React.ReactNode
}

export const BuildingProvider = ({
  building,
  children
}: BuildingProviderProps) => {
  return (
    <BuildingContext.Provider value={building}>
      {children}
    </BuildingContext.Provider>
  )
}
