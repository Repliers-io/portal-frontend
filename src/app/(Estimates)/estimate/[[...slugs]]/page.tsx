/* eslint-disable react/destructuring-assignment */
import React, { Suspense } from 'react'
import { type Metadata } from 'next'
import { features } from 'features'

import content from '@configs/content'
import { type EstimateData } from '@configs/estimate'
import { Page404Template } from '@templates'
import { EstimateRouteWrapper } from '@pages/estimate'

import { APIEstimate } from 'services/API'
import EstimateProvider from 'providers/EstimateProvider'
import EstimateStepsProvider from 'providers/EstimateStepsProvider'
import SearchProvider from 'providers/SearchProvider'
import SelectOptionsProvider from 'providers/SelectOptionsProvider'
import { formatShortAddress } from 'utils/properties'

import { parseEstimateParams } from './utils'

export type PageProps = {
  params: {
    slugs?: string[]
    clientId?: string
  }
  searchParams: {
    ulid?: string
    estimateId?: string
    clientId?: string
    step?: string
    s?: string
    [key: string]: string | undefined // Allow additional query parameters
  }
}

const generateResultMetadata = (
  estimateData: EstimateData | null
): Metadata => {
  const address = estimateData?.payload?.address || {}
  const localAddress = formatShortAddress(address)
  const { area, city, neighborhood } = address
  const location = area || city || neighborhood || ''

  const meta = content.estimateResultMetadata
  return {
    title: {
      absolute: String(meta.title || '').replace('$', localAddress)
    },
    description: String(meta.description || '').replace('$', location)
  }
}

export const generateMetadata = async (props: PageProps) => {
  const params = await props.params
  const searchParams = await props.searchParams
  const { estimateId, step } = parseEstimateParams(params, searchParams)

  // treat estimates without steps as result page
  if (estimateId && !step) {
    try {
      const isUlid = String(estimateId).length > 10 // TODO: think about better way to check it
      const estimateData = await APIEstimate.fetchEstimate(estimateId, isUlid)
      return generateResultMetadata(estimateData)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {}
    }
  }

  return content.estimateMetadata || {}
}

const EstimatePageContent = async (props: PageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params

  const { step, estimateId, clientId, signature, rest } = parseEstimateParams(
    params,
    searchParams
  )

  if (!features.estimate) return <Page404Template />

  return (
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
              <EstimateRouteWrapper />
            </Suspense>
          </EstimateStepsProvider>
        </EstimateProvider>
      </SelectOptionsProvider>
    </SearchProvider>
  )
}

export default EstimatePageContent
