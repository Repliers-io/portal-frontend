import queryString from 'query-string'

import { stepNames } from '@configs/estimate'
import { CDN } from '@configs/hosts'
import routes from '@configs/routes'

import { joinNonEmpty } from 'utils/strings'

export const getCDNPath = (fileName: string, size = 'large') =>
  fileName ? `${CDN}/${fileName}?&webp&class=${size}` : ''

export const getYoutubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/embed\/)([^"&?/\s]{11})/i
  const matches = url.match(regex)
  return matches ? matches[1] : ''
}

export const getProtocolHost = (headers?: Headers | null) => {
  if (!headers) {
    return 'http://localhost:3000'
  }
  let host = headers.get('host') || 'localhost'
  const protocol = headers.get('x-forwarded-proto') || 'http'
  const port = host.includes(':')
    ? host.split(':')[1]
    : headers.get('x-forwarded-port')
  host = host.split(':')[0] // remove port if present
  return `${protocol}://${host}${port ? `:${port}` : ''}`
}

export const extractProtocolHost = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const protocol = parsedUrl.protocol.replace(':', '')
    const domain = parsedUrl.hostname
    return { protocol, domain }
  } catch (error) {
    console.error('Invalid URL:', error)
    return {
      protocol: '',
      domain: ''
    }
  }
}

export const updateWindowHistory = (
  url: string,
  title: string = '',
  mode: 'replace' | 'push' = 'replace'
) => {
  if (mode === 'replace') {
    window.history.replaceState(null, title, url)
  } else {
    window.history.pushState(null, title, url)
  }
}

export const sanitizeUrl = (url: string) =>
  encodeURIComponent(
    String(url)
      .replaceAll('-', '‑') // replace minus with NON BREAKING HYPHEN
      .replaceAll(' ', '-')
      .toLowerCase()
  )

export const getCatalogUrl = (
  city: string = '',
  hood: string = '',
  filters: string[] = []
) => {
  const cityUrl = city ? `/${sanitizeUrl(city)}` : ''
  const hoodUrl = hood ? `/${sanitizeUrl(hood)}` : ''
  const filterUrl = filters.length ? `/${filters.join('-')}` : ''
  return `${routes.listings}${cityUrl}${hoodUrl}${filterUrl}`
}

type EstimateUrlParams = {
  estimatePage?: string
  rootPage?: string
  mode?: 'get-params' | 'route'
  step?: number | null
  ulid?: string
  estimateId?: number | string | null
  clientId?: number | null
  signature?: string
  agentRole?: boolean
  stepStringName?: boolean
}

export const getEstimateUrl = (params: EstimateUrlParams) => {
  const {
    estimatePage = routes.estimate,
    rootPage = '',
    mode = 'get-params',
    step,
    ulid,
    estimateId,
    clientId,
    signature,
    agentRole,
    stepStringName = false
  } = params

  let formStep = step
  // we need to show step=0 for agents but hide for clients
  if (!agentRole && !step) formStep = null
  // we need to hide it for EstimateResult page
  if (step === 0 && estimateId) formStep = null

  const emptyRoute = agentRole
    ? estimatePage // agents should always see the estimate page
    : rootPage || estimatePage

  const sanitizedParams = {
    step: formStep,
    ...(agentRole && { s: signature }),
    ...(ulid ? { ulid } : { estimateId }),
    clientId
  }

  const truthyParams = Object.fromEntries(
    Object.entries(sanitizedParams).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => Boolean(value) && value !== null
    )
  )

  if (mode === 'get-params') {
    const queryParams = queryString.stringify(truthyParams)
    return queryParams ? `${estimatePage}?${queryParams}` : emptyRoute
  } else {
    // mode === 'route'
    const count = Object.keys(truthyParams).length
    if (!count) return emptyRoute

    const { clientId, ulid, estimateId, step } = truthyParams

    const stepName = step
      ? stepStringName
        ? `step/${stepNames[(step || 0) as keyof typeof stepNames]}`
        : `step/${step || 0}`
      : null

    const anyId = ulid || estimateId

    const routeArr = [
      ...(agentRole && clientId ? [routes.agentClient, clientId] : []),
      estimatePage,
      anyId,
      step ? stepName : null
    ].flat()

    const routeString = joinNonEmpty(routeArr, '/').replace(/\/+/g, '/')
    return `${routeString}${signature && agentRole ? `?s=${signature}` : ''}` // signature should always be added as query param
  }
}
