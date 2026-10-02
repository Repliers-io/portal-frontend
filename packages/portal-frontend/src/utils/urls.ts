import queryString from 'query-string'

import apiConfig from '@configs/api'
import { stepNames } from '@configs/estimate'
import locationConfig from '@configs/location'
import routes from '@configs/routes'

import { type ApiLocation } from 'services/API'
import { capitalize, joinNonEmpty } from 'utils/strings'

export const LOCATION_SEPARATOR = '\\'

export type LocationParts = {
  area?: string
  city?: string
  neighborhood?: string
}

/**
 * Parse location path string into parts
 * @example parseLocationPath('Calgary|Downtown') => { area: 'Calgary', city: 'Downtown' }
 */
export const parseLocationPath = (path: string): LocationParts => {
  const [area, city, neighborhood] = path.split(LOCATION_SEPARATOR)
  return {
    area: area || undefined,
    city: city || undefined,
    neighborhood: neighborhood || undefined
  }
}

/**
 * Builds location path from location item's address
 * Format: [area] or [area]|[city] or [area]|[city]|[neighborhood]
 */
export const buildLocationPath = (location: ApiLocation): string => {
  const { type, name, address } = location
  const { area, city, neighborhood } = address || {}

  if (type === 'area') return area || ''

  if (type === 'city') return [area, city].join(LOCATION_SEPARATOR)

  if (type === 'neighborhood')
    return [area, city, neighborhood].join(LOCATION_SEPARATOR)

  return name || ''
}

export const getCDNPath = (
  fileName: string,
  size = 'large',
  photosUpdated?: string
) => {
  if (!fileName) return ''
  const [filePath, existingQuery] = fileName.split('?', 2)
  const existingT = existingQuery
    ? (queryString.parse(existingQuery).t as string | null)
    : null
  const base = `${apiConfig.repliersCdn}/${filePath}?webp&class=${size}`
  if (existingT) return `${base}&t=${existingT}`
  if (!photosUpdated) return base
  const t = Math.floor(new Date(photosUpdated).getTime() / 1000)
  return `${base}&t=${t}`
}

export const getUrlFilename = (urlOrKey: string | undefined): string => {
  if (!urlOrKey || !urlOrKey.startsWith('http')) return urlOrKey ?? ''
  try {
    const parsed = new URL(urlOrKey)
    const { t } = queryString.parse(parsed.search)
    const path = parsed.pathname.slice(1)
    return t ? `${path}?t=${t as string}` : path
  } catch {
    return urlOrKey ?? ''
  }
}

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
  const decodedUrl = decodeURIComponent(url)
  if (mode === 'replace') {
    window.history.replaceState(null, title, decodedUrl)
  } else {
    window.history.pushState(null, title, decodedUrl)
  }
}

export const sanitizeUrl = (url: string) =>
  encodeURIComponent(
    String(url)
      .replaceAll('-', '‑') // replace minus with NON BREAKING HYPHEN
      .replaceAll(' ', '-')
      .toLowerCase()
  )

/**
 * Inverse of sanitizeUrl — converts a URL slug back to a human-readable label.
 * Normalises dashes and capitalises.
 *
 * Deliberately does NOT strip the `-area` marker: that marker means "area level"
 * only to the URL grammar, and stripping it here corrupted every real location
 * whose name ends in " Area" (`central-area` → `Central`). The parser removes it
 * at the one place that decides a segment IS an area.
 */
export const beautify = (slug: string) =>
  capitalize(
    decodeURIComponent(
      slug
        .replace(/^-+|-+$/g, '')
        .replaceAll(/(-){3,}/g, ' - ')
        .replace(/(?<=\S)-+(?=\S)/g, ' ')
    ).trim()
  )

export const getLocationUrl = ({
  area,
  city,
  hood,
  filters = [],
  search,
  basePrefix
}: {
  area?: string
  city?: string
  hood?: string
  filters?: string[]
  search?: string
  basePrefix?: string
} = {}) => {
  // Build base URL prefix
  const prefix =
    basePrefix ??
    (locationConfig.useStateCodeRoute
      ? `/${locationConfig.stateCode.toLowerCase()}`
      : routes.locations)

  // If ONLY area is provided - format URL for area page
  if (area && !city && !hood) {
    const areaUrl = `/${sanitizeUrl(area)}-area`
    const filterUrl = filters.length ? `/${filters.join('-')}` : ''
    const searchParam = search ? `?search=${encodeURIComponent(search)}` : ''
    return `${prefix}${areaUrl}${filterUrl}${searchParam}`
  }

  // If city or hood are provided, area should NOT be in URL
  const cityUrl = city ? `/${sanitizeUrl(city)}` : ''
  const hoodUrl = hood ? `/${sanitizeUrl(hood)}` : ''
  const filterUrl = filters.length ? `/${filters.join('-')}` : ''
  const searchParam = search ? `?search=${encodeURIComponent(search)}` : ''

  return `${prefix}${cityUrl}${hoodUrl}${filterUrl}${searchParam}`
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
