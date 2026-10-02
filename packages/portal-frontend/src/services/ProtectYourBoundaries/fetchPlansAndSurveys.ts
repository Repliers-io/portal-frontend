import { cache } from 'react'

import { logError } from 'utils/log'

import { ProtectYourBoundariesAPI } from './ProtectYourBoundariesAPI'
import { type PlansAndSurveys } from './types'

/**
 * Fetches Plans & Surveys data for a listing coordinate.
 *
 * Designed to be called server-side (RSC / route handler).
 * Uses React `cache()` to deduplicate within a single request.
 *
 * Vendor prohibits caching — data is fetched live on every page load.
 * Failure returns [] without blocking the listing render.
 */
export const fetchPlansAndSurveys = cache(
  async (lat: number, lng: number): Promise<PlansAndSurveys> => {
    try {
      return await ProtectYourBoundariesAPI.fetchPlans(lat, lng)
    } catch (error) {
      logError('[ProtectYourBoundaries] fetchPlansAndSurveys failed:', error)
      return { plans: [], geoId: null }
    }
  }
)
