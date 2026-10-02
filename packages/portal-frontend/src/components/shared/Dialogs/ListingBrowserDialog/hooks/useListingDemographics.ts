import { useEffect, useState } from 'react'

import features from '@configs/features'

import { type ApiListing, APILocations } from 'services/API'
import type { LiveByDemographicsLocation } from 'services/API/types'

export const useListingDemographics = (listing?: ApiListing) => {
  const [demographics, setDemographics] =
    useState<LiveByDemographicsLocation | null>(null)

  useEffect(() => {
    const lat = Number(listing?.map.latitude)
    const lng = Number(listing?.map.longitude)
    if (!features.liveBy || !lat || !lng) {
      setDemographics(null)
      return
    }

    let active = true
    APILocations.fetchLiveByDemographics(lat, lng)
      .then((location) => {
        if (active) setDemographics(location)
      })
      .catch(() => {
        if (active) setDemographics(null)
      })

    return () => {
      active = false
    }
  }, [listing])

  return demographics
}
