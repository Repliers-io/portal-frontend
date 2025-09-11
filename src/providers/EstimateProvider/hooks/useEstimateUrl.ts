import { useCallback } from 'react'
import queryString from 'query-string'

import routes from '@configs/routes'

import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'
import { getEstimateUrl, updateWindowHistory } from 'utils/urls'

const useEstimateUrl = (
  mode: 'get-params' | 'route' = 'get-params',
  clientId?: number,
  signature?: string,
  rest: Record<string, string> = {}
) => {
  const features = useFeatures()
  const { agentRole } = useUser()
  const rootPage =
    features.rootPage === 'estimate' ? routes.home : routes.estimate

  const getUrl = useCallback(
    (
      estimateId?: number | string,
      step: number | null = null,
      forceClientUrl?: boolean
    ) => {
      const url = getEstimateUrl({
        step,
        rootPage,
        estimateId,
        agentRole: forceClientUrl ? false : agentRole,
        clientId, // from hook init
        signature, // from hook init
        mode // 'get-params' or 'route'
      })

      // Get current token from URL
      const { token } = queryString.parse(window?.location?.search)

      // Merge rest params and token
      const restParams = {
        ...rest,
        ...(token && { token })
      }

      if (Object.keys(restParams).length) {
        const restQuery = queryString.stringify(restParams)
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}${restQuery}`
      }
      return url
    },
    [mode, signature, clientId, agentRole, rest]
  )

  // WARN: this function REMOVES all not white-labelled query params from the url, like 'UTM', etc
  // we preserve only `token` query param, `signature`, and any params passed in `rest` parameter
  const updateEstimateUrl = useCallback(
    (
      estimateId?: number | string,
      step: number | null = null,
      forceClientUrl?: boolean
    ) => {
      updateWindowHistory(getUrl(estimateId, step, forceClientUrl))
    },
    [getUrl]
  )

  return {
    updateEstimateUrl,
    getEstimateUrl: getUrl /* export hook wrapper around pure function */
  }
}

export default useEstimateUrl
