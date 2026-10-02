import React, { Suspense } from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import { type EstimateData } from '@configs/estimate'
import features from '@configs/features'
import routes from '@configs/routes'
import { EstimatePageTemplate } from '@templates'
import { EstimateRouter } from '@pages/estimate'

import { type RouteProps } from 'app/types'

import { APIEstimate } from 'services/API'
import EstimateProvider from 'providers/EstimateProvider'
import EstimateStepsProvider from 'providers/EstimateStepsProvider'
import SearchProvider from 'providers/SearchProvider'
import SelectOptionsProvider from 'providers/SelectOptionsProvider'
import { formatShortAddress } from 'utils/listings'

import {
  type EstimateRouteParams,
  type EstimateRouteSearchParams
} from './types'
import { parseEstimateParams } from './utils'

export type EstimateRoutePageProps = RouteProps<
  EstimateRouteParams,
  EstimateRouteSearchParams
>

export const revalidate = 86400

const generateResultMetadata = (
  estimateData: EstimateData | null
): Metadata => {
  const address = estimateData?.payload?.address || {}
  const localAddress = formatShortAddress(address)
  const { area, city, neighborhood } = address
  const location = area || city || neighborhood || ''

  const meta = content.pagesMeta.estimateResult
  return {
    title: {
      absolute: String(meta.title || '').replace('{address}', localAddress)
    },
    description: String(meta.description || '').replace('{location}', location),
    openGraph: { type: 'website' as const, siteName: content.siteName }
  }
}

export const generateMetadata = async (
  props: EstimateRoutePageProps
): Promise<Metadata> => {
  const params = await props.params
  const searchParams = await props.searchParams
  const { estimateId, step } = parseEstimateParams(params, searchParams)

  // treat estimates without steps as result page
  if (estimateId && !step) {
    try {
      const isUlid = String(estimateId).length > 10 // TODO: think about better way to check it
      const estimateData = await APIEstimate.fetchEstimate(estimateId, isUlid)
      return generateResultMetadata(estimateData)
    } catch {
      return {}
    }
  }

  return content.pagesMeta.estimate
    ? {
        ...content.pagesMeta.estimate,
        openGraph: {
          ...(content.pagesMeta.estimate.openGraph ?? {}),
          siteName: content.siteName
        },
        alternates: { canonical: routes.estimate }
      }
    : {}
}

const EstimatePage = async (props: EstimateRoutePageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params

  const { step, estimateId, clientId, signature, rest } = parseEstimateParams(
    params,
    searchParams
  )

  if (!features.estimate) notFound()

  return (
    <EstimatePageTemplate>
      <SearchProvider>
        <SelectOptionsProvider>
          <EstimateProvider
            step={step}
            clientId={clientId}
            estimateId={estimateId}
            signature={signature}
            rest={rest}
          >
            <EstimateStepsProvider>
              <Suspense>
                <EstimateRouter />
              </Suspense>
            </EstimateStepsProvider>
          </EstimateProvider>
        </SelectOptionsProvider>
      </SearchProvider>
    </EstimatePageTemplate>
  )
}

export default EstimatePage
