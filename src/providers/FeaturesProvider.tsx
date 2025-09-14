'use client'

import React, { createContext, useContext } from 'react'
import { type Features, features } from 'features'

const FeaturesContext = createContext<Features | undefined>(undefined)

const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  )
}

export default FeaturesProvider

export const useFeatures = () => {
  const context = useContext(FeaturesContext)
  if (!context) {
    throw Error('useFeatures must be used within a FeaturesProvider')
  }
  return context
}
