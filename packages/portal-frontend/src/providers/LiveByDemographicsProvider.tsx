/**
 * Owns the LiveBy demographics for the listing's location (nullable when absent).
 * Exposes `useLiveByDemographics` (read).
 * Anatomy: docs → product-guide/listing-detail/technical
 */
'use client'

import { createContext, type ReactNode, useContext } from 'react'

import type { LiveByDemographicsLocation } from 'services/API/types'

const LiveByDemographicsContext =
  createContext<LiveByDemographicsLocation | null>(null)

export const useLiveByDemographics = () => useContext(LiveByDemographicsContext)

export const LiveByDemographicsProvider = ({
  demographics,
  children
}: {
  demographics: LiveByDemographicsLocation | null
  children: ReactNode
}) => (
  <LiveByDemographicsContext.Provider value={demographics}>
    {children}
  </LiveByDemographicsContext.Provider>
)
