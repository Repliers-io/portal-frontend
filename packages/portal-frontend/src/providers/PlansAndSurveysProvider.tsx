'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { type PlansAndSurveys } from 'services/ProtectYourBoundaries'

const empty: PlansAndSurveys = { plans: [], geoId: null }

const PlansAndSurveysContext = createContext<PlansAndSurveys>(empty)

export const PlansAndSurveysProvider = ({
  children,
  lat,
  lng
}: {
  children: React.ReactNode
  lat: number
  lng: number
}) => {
  const [data, setData] = useState<PlansAndSurveys>(empty)

  useEffect(() => {
    fetch(`/api/plans-surveys?lat=${lat}&lng=${lng}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.plans)) {
          setData({ plans: json.plans, geoId: json.geoId ?? null })
        }
      })
      .catch(() => {
        // Network / JSON errors are non-fatal — keep the empty result
      })
  }, [lat, lng])

  return (
    <PlansAndSurveysContext.Provider value={data}>
      {children}
    </PlansAndSurveysContext.Provider>
  )
}

export const usePlansAndSurveys = (): PlansAndSurveys => {
  return useContext(PlansAndSurveysContext)
}
